import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentRate() {
    // Attempt to find the latest USDT/VND or USD/VND snapshot
    let latestSnapshot = await this.prisma.rateSnapshot.findFirst({
      where: {
        baseCurrency: 'USDT',
        quoteCurrency: 'VND',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fallback if no USDT/VND snapshot is found
    if (!latestSnapshot) {
      latestSnapshot = await this.prisma.rateSnapshot.findFirst({
        where: {
          baseCurrency: 'USD',
          quoteCurrency: 'VND',
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    // Default rate if database is completely empty
    const rateValue = latestSnapshot ? Number(latestSnapshot.rate) : 25600;
    const updatedAt = latestSnapshot ? latestSnapshot.createdAt : new Date();

    // If database was empty, populate a default snapshot for future use
    if (!latestSnapshot) {
      await this.prisma.rateSnapshot.create({
        data: {
          baseCurrency: 'USDT',
          quoteCurrency: 'VND',
          rate: 25600,
          provider: 'MistyPay Default',
          sourcePayload: { info: 'Auto-populated default rate snapshot' },
        },
      });
    }

    return {
      pair: 'USDT/VND',
      rate: rateValue,
      updatedAt,
    };
  }
}
