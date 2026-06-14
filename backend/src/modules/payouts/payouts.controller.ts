import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { PayoutsService } from './payouts.service';

@Controller('webhooks/payos')
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Post('payout')
  @HttpCode(HttpStatus.OK)
  async handlePayosPayoutWebhook(@Body() body: any) {
    const result = await this.payoutsService.processPayosWebhook(body);
    if (!result.success) {
      return { success: false, error: result.message };
    }
    return { success: true };
  }
}
