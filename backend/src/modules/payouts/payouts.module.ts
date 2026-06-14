import { Module } from '@nestjs/common';
import { PayoutsService } from './payouts.service';
import { PayoutsController } from './payouts.controller';
import { PayoutProcessor } from './payouts.processor';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [QueuesModule],
  controllers: [PayoutsController],
  providers: [PayoutsService, PayoutProcessor],
  exports: [PayoutsService],
})
export class PayoutsModule {}
