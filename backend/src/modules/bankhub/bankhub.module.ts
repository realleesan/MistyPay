import { Module, Global } from '@nestjs/common';
import { BankHubService } from './bankhub.service';

@Global()
@Module({
  providers: [BankHubService],
  exports: [BankHubService],
})
export class BankHubModule {}
