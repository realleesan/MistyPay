import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { QrService } from './qr.service';
import { ParseQrDto } from './dto/parse-qr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseQr(@Body() parseQrDto: ParseQrDto) {
    const data = this.qrService.parseVietQr(parseQrDto.qrContent);
    return {
      success: true,
      data,
    };
  }
}
