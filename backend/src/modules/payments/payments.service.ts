import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QuoteStatus, PaymentStatus, QuoteStatus as PrismaQuoteStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async createPayment(userId: string, dto: CreatePaymentDto) {
    const { quoteId, pin } = dto;

    // 1. Verify PIN security
    await this.usersService.verifyPin(userId, { pin });

    // 2. Fetch and validate the quote
    const quote = await this.prisma.paymentQuote.findUnique({
      where: { id: quoteId },
    });

    if (!quote) {
      throw new NotFoundException('Payment quote not found');
    }

    if (quote.userId !== userId) {
      throw new ForbiddenException('You do not have permission to use this quote');
    }

    // Check database status
    if (quote.status === QuoteStatus.QUOTE_EXPIRED || quote.status === QuoteStatus.QUOTE_USED) {
      throw new BadRequestException(`This quote is already ${quote.status.toLowerCase()}`);
    }

    // Check expiration time
    if (new Date() > new Date(quote.expiresAt)) {
      // Mark as expired in db
      await this.prisma.paymentQuote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.QUOTE_EXPIRED },
      });
      throw new BadRequestException('Payment quote has expired');
    }

    // 3. Allocate deposit system wallet (TRON USDT)
    let depositAddress = 'TYd67Hwz6UjX7WJ9X7W2s32Gf2sSDF21'; // Fallback mockup Tron test wallet

    const systemWallet = await this.prisma.systemWallet.findFirst({
      where: {
        network: 'TRON',
        tokenSymbol: 'USDT',
        status: 'ACTIVE',
        walletType: 'HOT',
      },
    });

    if (systemWallet) {
      depositAddress = systemWallet.walletAddress;
    } else {
      this.logger.warn('No active TRON HOT system wallet found. Using fallback mockup address.');
    }

    // 4. Generate unique order code
    const orderCode = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 5. Create Payment Order and update Quote status atomically
    const paymentOrder = await this.prisma.$transaction(async (tx) => {
      // Mark quote as used
      await tx.paymentQuote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.QUOTE_USED },
      });

      // 15 minutes payment expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      // Create Payment Order
      return tx.paymentOrder.create({
        data: {
          userId,
          quoteId: quote.id,
          orderCode,
          amountVnd: quote.amountVnd,
          requiredUsdt: quote.totalUsdt,
          receivedUsdt: 0,
          merchantBankCode: quote.merchantBankCode,
          merchantBankName: quote.merchantBankName,
          merchantAccountNumber: quote.merchantAccountNumber,
          merchantAccountName: quote.merchantAccountName,
          depositAddress,
          paymentStatus: PaymentStatus.WAITING_USDT,
          expiresAt,
        },
      });
    });

    return {
      success: true,
      message: 'Payment order created successfully',
      data: {
        id: paymentOrder.id,
        orderCode: paymentOrder.orderCode,
        requiredUsdt: Number(paymentOrder.requiredUsdt),
        depositAddress: paymentOrder.depositAddress,
        expiresAt: paymentOrder.expiresAt.toISOString(),
        paymentStatus: paymentOrder.paymentStatus,
        merchant: {
          name: paymentOrder.merchantAccountName,
          bankName: paymentOrder.merchantBankName,
          accountNumber: paymentOrder.merchantAccountNumber,
        },
      },
    };
  }

  async getPaymentDetails(userId: string, paymentId: string) {
    const payment = await this.prisma.paymentOrder.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found');
    }

    if (payment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this payment order');
    }

    // Auto-expire payment order if WAITING_USDT and current time exceeds expiresAt
    if (payment.paymentStatus === PaymentStatus.WAITING_USDT && new Date() > new Date(payment.expiresAt)) {
      const expiredPayment = await this.prisma.paymentOrder.update({
        where: { id: paymentId },
        data: { paymentStatus: PaymentStatus.EXPIRED },
      });
      return {
        success: true,
        data: {
          id: expiredPayment.id,
          orderCode: expiredPayment.orderCode,
          requiredUsdt: Number(expiredPayment.requiredUsdt),
          receivedUsdt: Number(expiredPayment.receivedUsdt || 0),
          depositAddress: expiredPayment.depositAddress,
          expiresAt: expiredPayment.expiresAt.toISOString(),
          paymentStatus: expiredPayment.paymentStatus,
          merchant: {
            name: expiredPayment.merchantAccountName,
            bankName: expiredPayment.merchantBankName,
            accountNumber: expiredPayment.merchantAccountNumber,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        id: payment.id,
        orderCode: payment.orderCode,
        requiredUsdt: Number(payment.requiredUsdt),
        receivedUsdt: Number(payment.receivedUsdt || 0),
        depositAddress: payment.depositAddress,
        expiresAt: payment.expiresAt.toISOString(),
        paymentStatus: payment.paymentStatus,
        merchant: {
          name: payment.merchantAccountName,
          bankName: payment.merchantBankName,
          accountNumber: payment.merchantAccountNumber,
        },
      },
    };
  }

  async getPaymentStatus(userId: string, paymentId: string) {
    const payment = await this.prisma.paymentOrder.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        userId: true,
        paymentStatus: true,
        expiresAt: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment order not found');
    }

    if (payment.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this payment order');
    }

    let status = payment.paymentStatus;

    if (status === PaymentStatus.WAITING_USDT && new Date() > new Date(payment.expiresAt)) {
      status = PaymentStatus.EXPIRED;
      await this.prisma.paymentOrder.update({
        where: { id: paymentId },
        data: { paymentStatus: PaymentStatus.EXPIRED },
      });
    }

    return {
      success: true,
      data: {
        id: payment.id,
        paymentStatus: status,
      },
    };
  }
}
