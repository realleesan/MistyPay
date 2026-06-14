import { Controller, Post, Get, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Post()
  async createQuote(
    @GetUser('id') userId: string,
    @Body() createQuoteDto: CreateQuoteDto,
  ) {
    const data = await this.quotesService.createQuote(userId, createQuoteDto);
    return {
      success: true,
      data,
    };
  }

  @Get(':id')
  async getQuote(
    @GetUser('id') userId: string,
    @Param('id', new ParseUUIDPipe()) quoteId: string,
  ) {
    const data = await this.quotesService.getQuote(userId, quoteId);
    return {
      success: true,
      data,
    };
  }
}
