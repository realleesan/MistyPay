import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RatesService } from '../rates/rates.service';
import { ConfigService } from '@nestjs/config';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { QuoteStatus } from '@prisma/client';

@Injectable()
export class QuotesService {
  private readonly bankBinMap: Record<string, string> = {
    '970422': 'MB Bank',
    '970436': 'Vietcombank',
    '970407': 'Techcombank',
    '970415': 'VietinBank',
    '970418': 'BIDV',
    '970405': 'Agribank',
    '970416': 'ACB',
    '970432': 'VPBank',
    '970403': 'Sacombank',
    '970423': 'TPBank',
    '970437': 'HDBank',
    '970441': 'VIB',
    '970443': 'SHB',
    '970426': 'MSB',
    '970428': 'Nam A Bank',
    '970425': 'ABBANK',
    '970429': 'Saigonbank',
    '970419': 'NCB',
    '970448': 'PVcomBank',
    '970452': 'Kienlongbank',
    '970454': 'BVBank',
    '970457': 'Woori Bank',
    '970458': 'Shinhan Bank',
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly ratesService: RatesService,
    private readonly configService: ConfigService,
  ) {}

  async createQuote(userId: string, dto: CreateQuoteDto) {
    // 1. Fetch current exchange rate
    const currentRateData = await this.ratesService.getCurrentRate();
    const rate = currentRateData.rate;

    if (!rate || rate <= 0) {
      throw new BadRequestException('Invalid exchange rate config');
    }

    // 2. Load fee settings
    const serviceFeePercent = this.configService.get<number>('SERVICE_FEE_PERCENT', 0.015); // Default 1.5%
    const networkFeeUsdt = this.configService.get<number>('NETWORK_FEE_USDT', 0.05); // Default 0.05 USDT

    // 3. Perform calculations
    const amountVnd = dto.amountVnd;
    const baseUsdt = amountVnd / rate;
    const serviceFeeUsdt = baseUsdt * serviceFeePercent;
    const totalUsdt = baseUsdt + serviceFeeUsdt + networkFeeUsdt;

    // 4. Resolve bank name
    const bankName = this.bankBinMap[dto.merchantBankCode] || `Bank (BIN: ${dto.merchantBankCode})`;

    // 5. Expiration time (60 seconds)
    const expiresAt = new Date(Date.now() + 60 * 1000);

    // 6. Save quote in DB
    const quote = await this.prisma.paymentQuote.create({
      data: {
        userId,
        merchantBankCode: dto.merchantBankCode,
        merchantBankName: bankName,
        merchantAccountNumber: dto.merchantAccountNumber,
        merchantAccountName: dto.merchantName,
        amountVnd,
        rateUsdtVnd: rate,
        serviceFeeUsdt,
        networkFeeUsdt,
        totalUsdt,
        status: QuoteStatus.QUOTE_CREATED,
        expiresAt,
      },
    });

    return {
      quoteId: quote.id,
      amountVnd: Number(quote.amountVnd),
      rate: Number(quote.rateUsdtVnd),
      serviceFee: Number(quote.serviceFeeUsdt),
      networkFee: Number(quote.networkFeeUsdt),
      totalUsdt: Number(quote.totalUsdt),
      expiresAt: quote.expiresAt,
      merchant: {
        name: quote.merchantAccountName,
        bankName: quote.merchantBankName,
        accountNumber: quote.merchantAccountNumber,
      },
    };
  }

  async getQuote(userId: string, quoteId: string) {
    const quote = await this.prisma.paymentQuote.findFirst({
      where: {
        id: quoteId,
        userId,
      },
    });

    if (!quote) {
      throw new NotFoundException('Payment quote not found');
    }

    // Check expiration and update if necessary
    const isExpired = new Date() > quote.expiresAt;
    let currentStatus = quote.status;

    if (isExpired && quote.status === QuoteStatus.QUOTE_CREATED) {
      const updated = await this.prisma.paymentQuote.update({
        where: { id: quoteId },
        data: { status: QuoteStatus.QUOTE_EXPIRED },
      });
      currentStatus = updated.status;
    }

    return {
      quoteId: quote.id,
      amountVnd: Number(quote.amountVnd),
      rate: Number(quote.rateUsdtVnd),
      serviceFee: Number(quote.serviceFeeUsdt),
      networkFee: Number(quote.networkFeeUsdt),
      totalUsdt: Number(quote.totalUsdt),
      expiresAt: quote.expiresAt,
      status: currentStatus,
      isExpired: isExpired || currentStatus === QuoteStatus.QUOTE_EXPIRED,
      merchant: {
        name: quote.merchantAccountName,
        bankName: quote.merchantBankName,
        accountNumber: quote.merchantAccountNumber,
      },
    };
  }
}
