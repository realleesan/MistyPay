import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { PayoutsModule } from '../payouts/payouts.module';

@Module({
  imports: [PayoutsModule, ScheduleModule.forRoot()],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
