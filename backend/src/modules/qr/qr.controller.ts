import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { QrService } from './qr.service';
import { ParseQrDto } from './dto/parse-qr.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('parse')
  @HttpCode(HttpStatus.OK)
  async parseQr(@Body() parseQrDto: ParseQrDto) {
    const data = await this.qrService.parseVietQr(parseQrDto.qrContent);
    return {
      success: true,
      data,
    };
  }

  @Post('scan-image')
  @UseInterceptors(FileInterceptor('image'))
  @HttpCode(HttpStatus.OK)
  async scanImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file uploaded');
    }
    const data = await this.qrService.decodeQrFromImage(file.buffer);
    return {
      success: true,
      data,
    };
  }
}
