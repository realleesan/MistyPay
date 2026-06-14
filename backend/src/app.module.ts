import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { QueuesModule } from './modules/queues/queues.module';
import { PrismaModule } from './common/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RatesModule } from './modules/rates/rates.module';
import { QrModule } from './modules/qr/qr.module';
import { QuotesModule } from './modules/quotes/quotes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BlockchainModule } from './modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    PrismaModule,
    QueuesModule,
    HealthModule,
    AuthModule,
    UsersModule,
    RatesModule,
    QrModule,
    QuotesModule,
    PaymentsModule,
    BlockchainModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
