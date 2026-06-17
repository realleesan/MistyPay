import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD', undefined) || undefined,
          db: configService.get<number>('REDIS_DB', 0),
          tls: configService.get<string>('REDIS_HOST', 'localhost').includes('upstash.io') ? {} : undefined,
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue(
      { name: 'blockchain' },
      { name: 'payout' },
      { name: 'notification' },
      { name: 'reconciliation' },
    ),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
