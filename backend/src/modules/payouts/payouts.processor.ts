import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PayoutsService } from './payouts.service';
import { Logger } from '@nestjs/common';

@Processor('payout')
export class PayoutProcessor extends WorkerHost {
  private readonly logger = new Logger(PayoutProcessor.name);

  constructor(private readonly payoutsService: PayoutsService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of name ${job.name}`);

    if (job.name === 'processPayout') {
      const { paymentId, amountVnd, bankCode, accountNumber, accountName } = job.data;
      try {
        const result = await this.payoutsService.requestPayout(
          paymentId,
          amountVnd,
          bankCode,
          accountNumber,
          accountName,
        );
        return result;
      } catch (error) {
        this.logger.error(`Failed to process payout for payment ID ${paymentId}: ${error.message}`);
        throw error; // Propagate error for BullMQ retry policy
      }
    }
  }
}
