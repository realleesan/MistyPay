import { IsNotEmpty, IsString } from 'class-validator';

export class ParseQrDto {
  @IsNotEmpty()
  @IsString()
  qrContent: string;
}
