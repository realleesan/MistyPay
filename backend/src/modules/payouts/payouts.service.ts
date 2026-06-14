import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PayoutStatus, FinalStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class PayoutsService {
  private readonly logger = new Logger(PayoutsService.name);
  private readonly payoutProvider: string;
  private readonly payosApiUrl: string;
  private readonly payosClientId: string;
  private readonly payosApiKey: string;
  private readonly payosChecksumKey: string;
  private readonly payosWebhookSecret: string;
  private readonly appUrl: string;
  private readonly featureRealPayout: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.payoutProvider = this.configService.get<string>('PAYOUT_PROVIDER', 'PAYOS');
    this.payosApiUrl = this.configService.get<string>('PAYOS_API_URL', 'https://api.payos.vn');
    this.payosClientId = this.configService.get<string>('PAYOS_CLIENT_ID', '');
    this.payosApiKey = this.configService.get<string>('PAYOS_API_KEY', '');
    this.payosChecksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY', '');
    this.payosWebhookSecret = this.configService.get<string>('PAYOS_WEBHOOK_SECRET', '');
    this.appUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    this.featureRealPayout = this.configService.get<boolean>('FEATURE_REAL_PAYOUT', false);
  }

  /**
   * Generates a PayOS signature using HMAC-SHA256
   */
  generatePayosSignature(data: Record<string, any>, checksumKey: string): string {
    const sortedKeys = Object.keys(data).sort();
    const queryString = sortedKeys
      .map((key) => {
        const val = data[key];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') {
          return `${key}=${JSON.stringify(val)}`;
        }
        return `${key}=${val}`;
      })
      .filter(Boolean)
      .join('&');

    return crypto
      .createHmac('sha256', checksumKey)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Verifies the PayOS webhook signature
   */
  verifyPayosWebhookSignature(data: any, signature: string): boolean {
    if (!signature) return false;
    const computed = this.generatePayosSignature(data, this.payosChecksumKey);
    return computed === signature;
  }

  /**
   * Initiates a payout transaction for a payment order
   */
  async requestPayout(
    paymentOrderId: string,
    amountVnd: number,
    bankCode: string,
    accountNumber: string,
    accountName: string,
  ): Promise<any> {
    this.logger.log(`Initiating payout for order ${paymentOrderId} of ${amountVnd} VND to ${bankCode}/${accountNumber}`);

    // Fetch the payment order to verify
    const order = await this.prisma.paymentOrder.findUnique({
      where: { id: paymentOrderId },
      include: { user: true },
    });

    if (!order) {
      throw new Error(`Payment order ${paymentOrderId} not found.`);
    }

    if (order.paymentStatus !== 'USDT_CONFIRMED') {
      throw new Error(`Cannot payout for order ${paymentOrderId} because paymentStatus is ${order.paymentStatus}`);
    }

    // Create the payout transaction in PENDING status
    const payoutTx = await this.prisma.payoutTransaction.create({
      data: {
        paymentOrderId,
        provider: this.payoutProvider,
        bankCode,
        bankName: bankCode,
        accountNumber,
        accountName,
        amountVnd,
        status: PayoutStatus.PAYOUT_PENDING,
        retryCount: 0,
      },
    });

    // Update order status to processing
    await this.prisma.paymentOrder.update({
      where: { id: paymentOrderId },
      data: {
        payoutStatus: PayoutStatus.PAYOUT_PROCESSING,
      },
    });

    if (!this.featureRealPayout) {
      this.logger.log(`Simulation mode active. Simulating payout for order ${order.orderCode}`);
      
      // Update transaction status to processing
      const updatedPayoutTx = await this.prisma.payoutTransaction.update({
        where: { id: payoutTx.id },
        data: {
          status: PayoutStatus.PAYOUT_PROCESSING,
          requestedAt: new Date(),
          rawRequest: { simulated: true },
          rawResponse: { status: 'PROCESSING', simulated: true },
        },
      });

      // Simulate webhook after 2 seconds
      setTimeout(async () => {
        try {
          const webhookUrl = `${this.appUrl}/api/v1/webhooks/payos/payout`;
          const webhookData = {
            eventId: `sim_evt_${Date.now()}`,
            orderCode: order.orderCode,
            status: 'SUCCESS',
            amount: amountVnd,
            currency: 'VND',
            transactionId: `sim_tx_${Date.now()}`,
            timestamp: new Date().toISOString(),
          };
          const signature = this.generatePayosSignature(webhookData, this.payosChecksumKey || 'simulated_checksum_key');

          this.logger.log(`Sending simulated payout webhook callback to ${webhookUrl}`);
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              data: webhookData,
              signature: signature,
            }),
          });
        } catch (error) {
          this.logger.error(`Failed to execute simulated webhook: ${error.message}`);
        }
      }, 2000);

      return updatedPayoutTx;
    }

    // Real PayOS API invocation
    try {
      const payload = {
        orderCode: Number(order.orderCode.replace(/\D/g, '')) || Date.now(), // PayOS orderCode must be numeric
        amount: amountVnd,
        description: `MistyPay ${order.orderCode}`,
        cancelUrl: `${this.appUrl}/payment/failed`,
        returnUrl: `${this.appUrl}/payment/success`,
      };

      const signature = this.generatePayosSignature(payload, this.payosChecksumKey);
      const requestBody = {
        ...payload,
        signature,
      };

      const url = `${this.payosApiUrl}/v2/payment-requests`;
      this.logger.log(`Sending API request to PayOS: ${url}`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': this.payosClientId,
          'x-api-key': this.payosApiKey,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok || responseData.code !== '00') {
        const errMsg = responseData.desc || 'Unknown error from PayOS';
        this.logger.error(`PayOS API error: ${errMsg}`);
        throw new Error(errMsg);
      }

      // Update transaction status
      return await this.prisma.payoutTransaction.update({
        where: { id: payoutTx.id },
        data: {
          status: PayoutStatus.PAYOUT_PROCESSING,
          providerReference: responseData.data?.paymentLinkId || null,
          requestedAt: new Date(),
          rawRequest: requestBody as any,
          rawResponse: responseData as any,
        },
      });
    } catch (error) {
      this.logger.error(`Payout request failed: ${error.message}`);
      
      // Update payout transaction with error
      await this.prisma.payoutTransaction.update({
        where: { id: payoutTx.id },
        data: {
          status: PayoutStatus.PAYOUT_FAILED,
          errorCode: 'PAYOS_API_ERROR',
          errorMessage: error.message,
          rawResponse: { error: error.message },
        },
      });

      // Update payment order payoutStatus
      await this.prisma.paymentOrder.update({
        where: { id: paymentOrderId },
        data: {
          payoutStatus: PayoutStatus.PAYOUT_FAILED,
        },
      });

      throw error;
    }
  }

  /**
   * Processes the callback update from PayOS
   */
  async processPayosWebhook(webhookBody: any): Promise<{ success: boolean; message?: string }> {
    const { data, signature } = webhookBody;

    if (!data || !signature) {
      this.logger.warn('Invalid webhook payload structure (missing data or signature)');
      return { success: false, message: 'Missing data or signature' };
    }

    // Signature verification (unless in simulation/mock check)
    const isValidSignature = this.verifyPayosWebhookSignature(data, signature);
    const isSimulated = data.eventId && data.eventId.startsWith('sim_evt_');
    
    if (!isValidSignature && !isSimulated) {
      this.logger.warn('PayOS webhook signature verification failed');
      return { success: false, message: 'Invalid signature' };
    }

    const { orderCode, status, transactionId } = data;
    this.logger.log(`Processing PayOS webhook for order ${orderCode} with status ${status}`);

    // Find the payment order
    const order = await this.prisma.paymentOrder.findFirst({
      where: { orderCode: String(orderCode) },
    });

    if (!order) {
      this.logger.error(`Payment order for code ${orderCode} not found`);
      return { success: false, message: 'Order not found' };
    }

    // Check if payout is already completed to avoid double processing
    if (order.payoutStatus === PayoutStatus.PAYOUT_SUCCESS) {
      this.logger.log(`Order ${orderCode} already marked as PAYOUT_SUCCESS, ignoring`);
      return { success: true };
    }

    // Find the latest processing payout transaction
    const latestPayoutTx = await this.prisma.payoutTransaction.findFirst({
      where: {
        paymentOrderId: order.id,
        status: PayoutStatus.PAYOUT_PROCESSING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestPayoutTx) {
      this.logger.warn(`No active processing payout transaction found for order ID ${order.id}`);
    }

    if (status === 'SUCCESS' || status === 'PAID') {
      await this.prisma.$transaction(async (tx) => {
        // Update payment order to completed
        await tx.paymentOrder.update({
          where: { id: order.id },
          data: {
            payoutStatus: PayoutStatus.PAYOUT_SUCCESS,
            finalStatus: FinalStatus.SUCCESS,
            completedAt: new Date(),
          },
        });

        // Update payout transaction if it exists
        if (latestPayoutTx) {
          await tx.payoutTransaction.update({
            where: { id: latestPayoutTx.id },
            data: {
              status: PayoutStatus.PAYOUT_SUCCESS,
              providerReference: String(transactionId),
              completedAt: new Date(),
              rawResponse: data,
            },
          });
        }
      });

      this.logger.log(`Order ${orderCode} successfully completed via PayOS payout!`);
      
      // Trigger Telegram Alert
      await this.sendTelegramNotification(
        `✅ *Payout Successful*\n` +
        `• Order: \`${order.orderCode}\`\n` +
        `• Amount: \`${Number(order.amountVnd).toLocaleString('vi-VN')} VND\`\n` +
        `• Bank: \`${order.merchantBankCode}\`\n` +
        `• Account: \`${order.merchantAccountNumber}\`\n` +
        `• Name: \`${order.merchantAccountName}\``
      );

      return { success: true };
    } else {
      // Payout failed
      await this.prisma.$transaction(async (tx) => {
        await tx.paymentOrder.update({
          where: { id: order.id },
          data: {
            payoutStatus: PayoutStatus.PAYOUT_FAILED,
            finalStatus: FinalStatus.MANUAL_REVIEW,
          },
        });

        if (latestPayoutTx) {
          await tx.payoutTransaction.update({
            where: { id: latestPayoutTx.id },
            data: {
              status: PayoutStatus.PAYOUT_FAILED,
              errorMessage: `PayOS status: ${status}`,
              rawResponse: data,
            },
          });
        }
      });

      this.logger.warn(`PayOS payout failed for order ${orderCode} with status ${status}`);
      
      // Trigger Telegram Alert
      await this.sendTelegramNotification(
        `🚨 *Payout Failed*\n` +
        `• Order: \`${order.orderCode}\`\n` +
        `• Status: \`${status}\`\n` +
        `• Action: Moved to MANUAL_REVIEW`
      );

      return { success: true };
    }
  }

  /**
   * Helper to send Telegram notifications
   */
  private async sendTelegramNotification(text: string): Promise<void> {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

    if (!token || !chatId) {
      this.logger.debug('Telegram credentials missing, skipping alert.');
      return;
    }

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown',
        }),
      });
    } catch (e) {
      this.logger.error(`Failed to send telegram notification: ${e.message}`);
    }
  }
}
