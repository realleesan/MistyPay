import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { QueuesModule } from '../queues/queues.module';

@Module({
  imports: [QueuesModule],
  providers: [BlockchainService],
  exports: [BlockchainService],
})
export class BlockchainModule {}
