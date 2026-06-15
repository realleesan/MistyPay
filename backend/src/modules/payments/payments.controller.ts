import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  BadRequestException,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { BlockchainService } from '../blockchain/blockchain.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @GetUser('id') userId: string,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentsService.createPayment(userId, createPaymentDto);
  }

  @Get()
  async getUserPayments(@GetUser('id') userId: string) {
    return this.paymentsService.getUserPayments(userId);
  }

  @Post(':id/simulate-deposit')
  @HttpCode(HttpStatus.OK)
  async simulateDeposit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
    @Body('fromAddress') fromAddress: string,
  ) {
    if (!amount || amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }
    const from = fromAddress || 'TMockSenderAddressXXXXXXXXXXXXXX';
    const tx = await this.blockchainService.simulateDeposit(id, amount, from);
    return {
      success: true,
      message: 'Simulated deposit transaction created. Processing...',
      data: tx,
    };
  }

  @Get(':id')
  async getPaymentDetails(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.getPaymentDetails(userId, id);
  }

  @Get(':id/status')
  async getPaymentStatus(
    @GetUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.paymentsService.getPaymentStatus(userId, id);
  }
}
