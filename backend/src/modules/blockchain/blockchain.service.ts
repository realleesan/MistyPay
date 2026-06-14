import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../common/prisma/prisma.service';
import { BlockchainTxStatus, PaymentStatus } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling = false;

  // TRON USDT Contract addresses (Mainnet standard)
  private readonly USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    @InjectQueue('payout') private readonly payoutQueue: Queue,
  ) {}

  onModuleInit() {
    this.logger.log('Initializing Blockchain Monitor Service...');
    const pollIntervalSeconds = this.configService.get<number>('BLOCKCHAIN_POLL_INTERVAL_SECONDS', 10);
    
    // Start background polling loop
    this.pollingInterval = setInterval(() => {
      this.checkPendingPayments();
    }, pollIntervalSeconds * 1000);
  }

  onModuleDestroy() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
  }

  /**
   * Main background task: scan TRON blockchain for all pending payment orders
   */
  async checkPendingPayments() {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      // Find all orders waiting for USDT deposit
      const pendingOrders = await this.prisma.paymentOrder.findMany({
        where: {
          paymentStatus: PaymentStatus.WAITING_USDT,
          expiresAt: { gt: new Date() },
        },
      });

      if (pendingOrders.length === 0) {
        this.isPolling = false;
        return;
      }

      this.logger.debug(`Found ${pendingOrders.length} pending payment orders to check.`);

      // Read simulation mode config
      const useRealBlockchain = this.configService.get<boolean>('FEATURE_REAL_BLOCKCHAIN', false);

      for (const order of pendingOrders) {
        if (useRealBlockchain) {
          await this.scanRealTronGridForOrder(order);
        } else {
          // Simulation mode: transactions are simulated by separate triggers, 
          // or we check if there are simulated txs added.
          await this.scanSimulatedTxForOrder(order);
        }
      }
    } catch (error) {
      this.logger.error('Error during pending payments check:', error);
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Scan TRON blockchain via TronGrid API for a specific payment order
   */
  private async scanRealTronGridForOrder(order: any) {
    const depositAddress = order.depositAddress;
    const apiUrl = this.configService.get<string>('TRON_GRID_API_URL', 'https://api.trongrid.io');
    const apiKey = this.configService.get<string>('TRON_GRID_API_KEY', '');

    try {
      const url = `${apiUrl}/v1/accounts/${depositAddress}/transactions/trc20?limit=20`;
      const response = await fetch(url, {
        headers: apiKey ? { 'TRON-PRO-API-KEY': apiKey } : {},
      });

      if (!response.ok) {
        this.logger.warn(`TronGrid returned status ${response.status} for address ${depositAddress}`);
        return;
      }

      const json = await response.json() as any;
      if (!json || !json.success || !json.data) {
        return;
      }

      const transfers = json.data;
      const tolerance = this.configService.get<number>('USDT_AMOUNT_TOLERANCE', 0.01);
      const requiredAmount = Number(order.requiredUsdt);

      for (const tx of transfers) {
        // 1. Confirm TRC20 token is USDT
        const tokenAddress = tx.token_info?.address;
        if (tokenAddress !== this.USDT_CONTRACT) continue;

        // 2. Confirm destination address
        if (tx.to !== depositAddress) continue;

        // 3. Confirm transaction occurred after the payment order was created
        const txTimestamp = Number(tx.block_timestamp);
        const orderTimestamp = new Date(order.createdAt).getTime();
        if (txTimestamp < orderTimestamp) continue;

        // 4. Check double-processing (txHash uniqueness)
        const txHash = tx.transaction_id;
        const exists = await this.prisma.blockchainTransaction.findUnique({
          where: { txHash },
        });
        if (exists) continue;

        // 5. Parse transfer amount (USDT is 6 decimals)
        const rawValue = Number(tx.value);
        const decimals = Number(tx.token_info?.decimals || 6);
        const receivedAmount = rawValue / Math.pow(10, decimals);

        // Found matching blockchain transaction!
        this.logger.log(`Matching USDT transaction detected on-chain for order ${order.orderCode}. TxHash: ${txHash}`);
        await this.processSuccessfulDeposit(order, txHash, tx.from, receivedAmount, requiredAmount, tolerance, tx);
        break; // Only process one matching transaction per check
      }
    } catch (error) {
      this.logger.error(`Error scanning TronGrid for address ${depositAddress}:`, error);
    }
  }

  /**
   * Monitor helper for simulation mode (reads simulated txs or triggers)
   */
  private async scanSimulatedTxForOrder(order: any) {
    // In mock mode, we look if a test transaction has been manually added 
    // to the BlockchainTransaction table but not linked to the paymentOrder, 
    // or we poll for simulated trigger.
    const unmatchedTx = await this.prisma.blockchainTransaction.findFirst({
      where: {
        paymentOrderId: null,
        toAddress: order.depositAddress,
        createdAt: { gte: order.createdAt },
      },
    });

    if (unmatchedTx) {
      const receivedAmount = Number(unmatchedTx.amount);
      const requiredAmount = Number(order.requiredUsdt);
      const tolerance = this.configService.get<number>('USDT_AMOUNT_TOLERANCE', 0.01);

      this.logger.log(`Matching SIMULATED transaction detected for order ${order.orderCode}. TxHash: ${unmatchedTx.txHash}`);
      await this.processSuccessfulDeposit(order, unmatchedTx.txHash, unmatchedTx.fromAddress, receivedAmount, requiredAmount, tolerance, null);
    }
  }

  /**
   * Handle states and updates once transaction matches an order
   */
  private async processSuccessfulDeposit(
    order: any,
    txHash: string,
    fromAddress: string,
    receivedAmount: number,
    requiredAmount: number,
    tolerance: number,
    rawPayload: any
  ) {
    // Determine paymentStatus
    let nextStatus: PaymentStatus = PaymentStatus.USDT_CONFIRMED;
    const diff = receivedAmount - requiredAmount;

    if (diff < -tolerance) {
      nextStatus = PaymentStatus.UNDERPAID;
    } else if (diff > tolerance) {
      nextStatus = PaymentStatus.OVERPAID;
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        // Link or create blockchain transaction
        await tx.blockchainTransaction.upsert({
          where: { txHash },
          update: {
            paymentOrderId: order.id,
            status: BlockchainTxStatus.CONFIRMED,
            confirmedAt: new Date(),
          },
          create: {
            paymentOrderId: order.id,
            network: 'TRON',
            tokenSymbol: 'USDT',
            txHash,
            fromAddress,
            toAddress: order.depositAddress,
            amount: receivedAmount,
            status: BlockchainTxStatus.CONFIRMED,
            confirmedAt: new Date(),
            rawPayload: rawPayload || {},
          },
        });

        // Update payment order status
        await tx.paymentOrder.update({
          where: { id: order.id },
          data: {
            receivedUsdt: receivedAmount,
            paymentStatus: nextStatus,
            completedAt: new Date(),
          },
        });
      });

      this.logger.log(`Order ${order.orderCode} state updated to ${nextStatus}. Received: ${receivedAmount} USDT`);

      // Trigger Payout via BullMQ if status is USDT_CONFIRMED
      if (nextStatus === PaymentStatus.USDT_CONFIRMED) {
        try {
          await this.payoutQueue.add(
            'processPayout',
            {
              paymentId: order.id,
              orderCode: order.orderCode,
              amountVnd: Number(order.amountVnd),
              bankCode: order.merchantBankCode || '970422', // Default mock bank code if empty
              accountNumber: order.merchantAccountNumber || '123456789',
              accountName: order.merchantAccountName || 'Merchant Name',
            },
            {
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 60000,
              },
            },
          );
          this.logger.log(`Payout job queued in BullMQ for order ${order.orderCode}`);
        } catch (queueErr) {
          this.logger.error(`Failed to queue payout job in BullMQ: ${queueErr.message}`);
        }
      }

      // Trigger Telegram Alert
      await this.sendTelegramAlert(order.orderCode, nextStatus, receivedAmount);

    } catch (error) {
      this.logger.error(`Error processing successful deposit for order ${order.orderCode}:`, error);
    }
  }

  /**
   * External webhook / test trigger to simulate a transaction
   */
  async simulateDeposit(paymentId: string, amount: number, fromAddress: string): Promise<any> {
    const order = await this.prisma.paymentOrder.findUnique({
      where: { id: paymentId },
    });

    if (!order) {
      throw new Error('Payment order not found');
    }

    if (order.paymentStatus !== PaymentStatus.WAITING_USDT) {
      throw new Error(`Payment order is already in state: ${order.paymentStatus}`);
    }

    const txHash = `sim-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Insert as an unmatched transaction, the background scanner will automatically detect it
    const txRecord = await this.prisma.blockchainTransaction.create({
      data: {
        network: 'TRON',
        tokenSymbol: 'USDT',
        txHash,
        fromAddress,
        toAddress: order.depositAddress,
        amount,
        status: BlockchainTxStatus.DETECTED,
      },
    });

    this.logger.log(`Created simulation transaction for address ${order.depositAddress}. TxHash: ${txHash}`);
    return txRecord;
  }

  /**
   * Send notification to Telegram group
   */
  private async sendTelegramAlert(orderCode: string, status: PaymentStatus, amount: number) {
    const isAlertEnabled = this.configService.get<boolean>('TREASURY_ALERT_ENABLED', true);
    if (!isAlertEnabled) return;

    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN', '');
    const chatId = this.configService.get<string>('TELEGRAM_CHAT_ID', '');

    if (!token || !chatId || token === 'change_me' || chatId === 'change_me') {
      this.logger.warn('Telegram alerts are enabled but credentials (token/chatId) are missing.');
      return;
    }

    let statusEmoji = '✅';
    if (status === PaymentStatus.UNDERPAID) statusEmoji = '⚠️ [UNDERPAID]';
    if (status === PaymentStatus.OVERPAID) statusEmoji = '🚀 [OVERPAID]';

    const message = `🔔 *MistyPay Transaction Alert*\n\n` +
      `*Order Code:* \`${orderCode}\`\n` +
      `*Status:* ${statusEmoji} ${status}\n` +
      `*Amount Received:* \`${amount.toFixed(2)} USDT\`\n` +
      `*Timestamp:* \`${new Date().toISOString()}\``;

    try {
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
      this.logger.debug(`Telegram notification sent for order ${orderCode}`);
    } catch (error) {
      this.logger.error('Failed to send Telegram notification:', error);
    }
  }
}
