import { Controller, Get } from '@nestjs/common';
import { RatesService } from './rates.service';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('current')
  async getCurrentRate() {
    const rateData = await this.ratesService.getCurrentRate();
    return {
      success: true,
      data: rateData,
    };
  }
}
