import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RatesService implements OnModuleInit {
  private readonly logger = new Logger(RatesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    this.logger.log('Initializing RatesService: Fetching initial exchange rate...');
    // Fetch rate on startup so database is never stale
    await this.fetchAndStoreRate();
  }

  // Run automatically every 5 minutes in production
  @Cron('*/5 * * * *')
  async fetchAndStoreRate() {
    this.logger.log('Starting automated exchange rate fetch from providers...');

    // 1. Try Binance P2P API
    try {
      const rate = await this.fetchBinanceP2P();
      if (rate > 0) {
        await this.saveRateSnapshot('USDT', 'VND', rate, 'BINANCE_P2P', { source: 'Binance P2P search API' });
        this.logger.log(`Successfully updated rate to ${rate} VND via BINANCE_P2P`);
        return;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch from Binance P2P: ${error.message}. Trying CoinGecko...`);
    }

    // 2. Try CoinGecko API (fallback)
    try {
      const rate = await this.fetchCoinGecko();
      if (rate > 0) {
        await this.saveRateSnapshot('USDT', 'VND', rate, 'COINGECKO', { source: 'CoinGecko simple price API' });
        this.logger.log(`Successfully updated rate to ${rate} VND via COINGECKO`);
        return;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch from CoinGecko: ${error.message}. Trying KuCoin...`);
    }

    // 3. Try KuCoin API (fallback)
    try {
      const rate = await this.fetchKuCoin();
      if (rate > 0) {
        await this.saveRateSnapshot('USDT', 'VND', rate, 'KUCOIN', { source: 'KuCoin public prices API' });
        this.logger.log(`Successfully updated rate to ${rate} VND via KUCOIN`);
        return;
      }
    } catch (error) {
      this.logger.error(`Failed to fetch rate from KuCoin: ${error.message}. No more sources available.`);
    }
  }

  private async fetchBinanceP2P(): Promise<number> {
    const payload = {
      fiat: 'VND',
      page: 1,
      rows: 5,
      tradeType: 'BUY',
      asset: 'USDT',
      countries: [],
      proMerchantAds: false,
      shieldMerchantAds: false,
      publisherType: null,
      payTypes: [],
    };

    const response = await fetch('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error status ${response.status}`);
    }

    const data = (await response.json()) as any;
    if (data?.data && data.data.length > 0) {
      const rate = Number(data.data[0].adv.price);
      if (!isNaN(rate) && rate > 0) {
        return rate;
      }
    }
    throw new Error('Invalid response structure or empty data');
  }

  private async fetchCoinGecko(): Promise<number> {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=vnd');
    if (!response.ok) {
      throw new Error(`HTTP error status ${response.status}`);
    }
    const data = (await response.json()) as any;
    const rate = Number(data?.tether?.vnd);
    if (!isNaN(rate) && rate > 0) {
      return rate;
    }
    throw new Error('Invalid response format');
  }

  private async fetchKuCoin(): Promise<number> {
    const response = await fetch('https://api.kucoin.com/api/v1/prices?base=USDT&currencies=VND');
    if (!response.ok) {
      throw new Error(`HTTP error status ${response.status}`);
    }
    const data = (await response.json()) as any;
    const rate = Number(data?.data?.VND);
    if (!isNaN(rate) && rate > 0) {
      return rate;
    }
    throw new Error('Invalid response format');
  }

  private async saveRateSnapshot(
    baseCurrency: string,
    quoteCurrency: string,
    rate: number,
    provider: string,
    sourcePayload: any,
  ) {
    await this.prisma.rateSnapshot.create({
      data: {
        baseCurrency,
        quoteCurrency,
        rate,
        provider,
        sourcePayload,
      },
    });
  }

  async getCurrentRate() {
    let latestSnapshot = await this.prisma.rateSnapshot.findFirst({
      where: {
        baseCurrency: 'USDT',
        quoteCurrency: 'VND',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

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

    const rateValue = latestSnapshot ? Number(latestSnapshot.rate) : 25600;
    const updatedAt = latestSnapshot ? latestSnapshot.createdAt : new Date();

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

