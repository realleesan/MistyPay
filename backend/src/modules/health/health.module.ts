import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'blockchain' }),
  ],
  controllers: [HealthController],
})
export class HealthModule {}
