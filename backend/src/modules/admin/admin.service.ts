import { Injectable, Logger, UnauthorizedException, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PayoutsService } from '../payouts/payouts.service';
import { PayoutStatus, PaymentStatus, FinalStatus, AdminRole } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly payoutsService: PayoutsService,
  ) {}

  /**
   * Seed a default admin on startup if none exist
   */
  async onModuleInit() {
    const adminCount = await this.prisma.adminUser.count();
    if (adminCount === 0) {
      const defaultEmail = 'admin@mistypay.com';
      const defaultPassword = 'password123';
      const rounds = this.configService.get<number>('BCRYPT_SALT_ROUNDS', 12);
      const passwordHash = await bcrypt.hash(defaultPassword, rounds);

      await this.prisma.adminUser.create({
        data: {
          email: defaultEmail,
          passwordHash,
          role: AdminRole.ADMIN,
        },
      });

      this.logger.log(`[SEED] Created default admin account: ${defaultEmail} / ${defaultPassword}`);
    }
  }

  /**
   * Admin Login
   */
  async login(email: string, password: string): Promise<{ accessToken: string; admin: any }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email },
    });

    if (!admin || admin.status !== 'ACTIVE') {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: admin.id, email: admin.email, role: admin.role };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get<any>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    return {
      accessToken,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };
  }

  /**
   * Write Audit Log helper
   */
  async logAction(
    actorId: string,
    action: string,
    entityType?: string,
    entityId?: string,
    metadata?: any,
    ipAddress?: string,
  ) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorType: 'ADMIN',
          actorId,
          action,
          entityType,
          entityId,
          metadata: metadata || {},
          ipAddress,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${err.message}`);
    }
  }

  /**
   * Fetch Dashboard Statistics
   */
  async getDashboardStats() {
    const totalOrders = await this.prisma.paymentOrder.count();
    
    // Aggregation of USDT and VND
    const orders = await this.prisma.paymentOrder.findMany({
      where: { finalStatus: FinalStatus.SUCCESS },
    });

    const totalUsdtReceived = orders.reduce((sum, o) => sum + Number(o.receivedUsdt || 0), 0);
    const totalVndPayout = orders.reduce((sum, o) => sum + Number(o.amountVnd || 0), 0);

    const pendingOrdersCount = await this.prisma.paymentOrder.count({
      where: { paymentStatus: PaymentStatus.WAITING_USDT },
    });

    const manualReviewCount = await this.prisma.paymentOrder.count({
      where: { finalStatus: FinalStatus.MANUAL_REVIEW },
    });

    return {
      totalOrders,
      totalUsdtReceived,
      totalVndPayout,
      pendingOrdersCount,
      manualReviewCount,
    };
  }

  /**
   * Fetch manual review items
   */
  async getManualReviewQueue() {
    return this.prisma.paymentOrder.findMany({
      where: {
        OR: [
          { finalStatus: FinalStatus.MANUAL_REVIEW },
          { payoutStatus: PayoutStatus.PAYOUT_FAILED },
        ],
      },
      include: {
        payoutTransactions: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: { id: true, displayName: true, email: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Approve/Retry Payout manually
   */
  async approvePayout(orderId: string, adminId: string, ipAddress?: string) {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Payment order not found');
    }

    if (order.payoutStatus === PayoutStatus.PAYOUT_SUCCESS) {
      throw new BadRequestException('Payout is already completed successfully');
    }

    this.logger.log(`Admin ${adminId} approved payout for order ${order.orderCode} manually.`);

    // Set paymentStatus to USDT_CONFIRMED to allow payoutsService.requestPayout to proceed
    await this.prisma.paymentOrder.update({
      where: { id: order.id },
      data: {
        paymentStatus: PaymentStatus.USDT_CONFIRMED,
      },
    });

    // Invoke payoutsService to trigger transfer
    const updatedTx = await this.payoutsService.requestPayout(
      order.id,
      Number(order.amountVnd),
      order.merchantBankCode || '970422',
      order.merchantAccountNumber || '123456789',
      order.merchantAccountName || 'Merchant',
    );

    // Audit log
    await this.logAction(
      adminId,
      'APPROVE_PAYOUT_MANUAL',
      'PaymentOrder',
      order.id,
      { orderCode: order.orderCode, amountVnd: Number(order.amountVnd) },
      ipAddress,
    );

    return {
      success: true,
      message: 'Manual payout triggered successfully.',
      data: updatedTx,
    };
  }

  /**
   * Reject Payout
   */
  async rejectPayout(orderId: string, adminId: string, ipAddress?: string) {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Payment order not found');
    }

    await this.prisma.$transaction(async (tx) => {
      // Mark as FAILED
      await tx.paymentOrder.update({
        where: { id: order.id },
        data: {
          payoutStatus: PayoutStatus.PAYOUT_FAILED,
          finalStatus: FinalStatus.FAILED,
        },
      });

      // Update latest payout transaction to FAILED if it exists and is not complete
      const latestTx = await tx.payoutTransaction.findFirst({
        where: { paymentOrderId: order.id, status: { not: PayoutStatus.PAYOUT_SUCCESS } },
        orderBy: { createdAt: 'desc' },
      });

      if (latestTx) {
        await tx.payoutTransaction.update({
          where: { id: latestTx.id },
          data: {
            status: PayoutStatus.PAYOUT_FAILED,
            errorMessage: 'Rejected by admin.',
          },
        });
      }
    });

    // Audit log
    await this.logAction(
      adminId,
      'REJECT_PAYOUT_MANUAL',
      'PaymentOrder',
      order.id,
      { orderCode: order.orderCode },
      ipAddress,
    );

    return {
      success: true,
      message: 'Payout rejected manually.',
    };
  }

  /**
   * Trigger Manual Reconciliation
   */
  async runManualReconciliation(dateStr: string, adminId: string, ipAddress?: string) {
    const date = dateStr ? new Date(dateStr) : new Date();
    
    // Set to start of the given date
    const startOfDay = new Date(date.setHours(0,0,0,0));
    const endOfDay = new Date(date.setHours(23,59,59,999));

    // Load all orders for the day
    const dayOrders = await this.prisma.paymentOrder.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        payoutTransactions: true,
        blockchainTransactions: true,
      },
    });

    let totalOrdersCount = dayOrders.length;
    let totalUsdtReceived = 0;
    let totalVndPayout = 0;
    let discrepanciesCount = 0;
    const discrepanciesDetails: any[] = [];

    for (const order of dayOrders) {
      const isSuccess = order.finalStatus === FinalStatus.SUCCESS;
      if (isSuccess) {
        totalUsdtReceived += Number(order.receivedUsdt || 0);
        totalVndPayout += Number(order.amountVnd || 0);
      }

      // Check for mismatch issues:
      // 1. Order is success but payout isn't success, or vice versa
      const hasPayoutSuccessTx = order.payoutTransactions.some(t => t.status === PayoutStatus.PAYOUT_SUCCESS);
      const isPayoutSuccessState = order.payoutStatus === PayoutStatus.PAYOUT_SUCCESS;

      if (isSuccess && (!hasPayoutSuccessTx || !isPayoutSuccessState)) {
        discrepanciesCount++;
        discrepanciesDetails.push({
          orderId: order.id,
          orderCode: order.orderCode,
          issue: 'Order marked SUCCESS but payout is incomplete or missing successful transaction.',
        });
      } else if (!isSuccess && isPayoutSuccessState) {
        discrepanciesCount++;
        discrepanciesDetails.push({
          orderId: order.id,
          orderCode: order.orderCode,
          issue: 'Order not marked SUCCESS but payout transaction is recorded as SUCCESS.',
        });
      }
    }

    const reportStatus = discrepanciesCount > 0 ? 'DISCREPANCY' : 'MATCHED';

    const report = await this.prisma.reconciliationReport.upsert({
      where: { reportDate: startOfDay },
      update: {
        totalOrdersCount,
        totalUsdtReceived,
        totalVndPayout,
        discrepanciesCount,
        discrepanciesDetails: discrepanciesDetails as any,
        status: reportStatus,
      },
      create: {
        reportDate: startOfDay,
        totalOrdersCount,
        totalUsdtReceived,
        totalVndPayout,
        discrepanciesCount,
        discrepanciesDetails: discrepanciesDetails as any,
        status: reportStatus,
      },
    });

    await this.logAction(
      adminId,
      'RUN_RECONCILIATION',
      'ReconciliationReport',
      report.id,
      { reportDate: startOfDay.toISOString(), status: reportStatus, discrepanciesCount },
      ipAddress,
    );

    return report;
  }

  /**
   * Fetch Treasury Status — aggregates USDT and VND balances from DB records
   */
  async getTreasuryStatus() {
    // Sum all successful USDT received across all completed orders
    const successOrders = await this.prisma.paymentOrder.findMany({
      where: { finalStatus: FinalStatus.SUCCESS },
      select: { receivedUsdt: true, amountVnd: true },
    });

    const totalUsdtReceived = successOrders.reduce(
      (sum, o) => sum + Number(o.receivedUsdt || 0), 0,
    );
    const totalVndPaidOut = successOrders.reduce(
      (sum, o) => sum + Number(o.amountVnd || 0), 0,
    );

    // Sum VND pending payout (orders confirmed but not yet paid out)
    const pendingPayoutOrders = await this.prisma.paymentOrder.findMany({
      where: {
        paymentStatus: PaymentStatus.USDT_CONFIRMED,
        payoutStatus: { in: [PayoutStatus.PAYOUT_PENDING, PayoutStatus.PAYOUT_PROCESSING] },
      },
      select: { amountVnd: true },
    });
    const pendingVndPayout = pendingPayoutOrders.reduce(
      (sum, o) => sum + Number(o.amountVnd || 0), 0,
    );

    // System wallets
    const systemWallets = await this.prisma.systemWallet.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        network: true,
        tokenSymbol: true,
        walletAddress: true,
        walletType: true,
      },
    });

    // Manual review orders count and value
    const manualReviewOrders = await this.prisma.paymentOrder.findMany({
      where: { finalStatus: FinalStatus.MANUAL_REVIEW },
      select: { amountVnd: true, receivedUsdt: true },
    });
    const manualReviewTotalVnd = manualReviewOrders.reduce(
      (sum, o) => sum + Number(o.amountVnd || 0), 0,
    );

    return {
      usdt: {
        totalReceived: totalUsdtReceived,
      },
      vnd: {
        totalPaidOut: totalVndPaidOut,
        pendingPayout: pendingVndPayout,
        manualReviewHeld: manualReviewTotalVnd,
      },
      systemWallets,
      manualReviewCount: manualReviewOrders.length,
    };
  }

  /**
   * Scheduled Cron Job — runs daily at 23:55 to auto-generate reconciliation report
   */
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async runScheduledReconciliation() {
    this.logger.log('[CRON] Running scheduled daily reconciliation...');

    const todayStr = new Date().toISOString().split('T')[0];

    try {
      const report = await this.runManualReconciliation(todayStr, 'SYSTEM_CRON');
      this.logger.log(
        `[CRON] Daily reconciliation complete: ${report.totalOrdersCount} orders checked, ` +
        `${report.discrepanciesCount} discrepancies, status=${report.status}`,
      );
    } catch (err) {
      this.logger.error(`[CRON] Scheduled reconciliation failed: ${err.message}`);
    }
  }
}
