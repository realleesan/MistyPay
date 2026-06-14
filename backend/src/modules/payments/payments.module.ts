import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users/users.module';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({
  imports: [UsersModule, BlockchainModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
