import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';

export class CreateQuoteDto {
  @IsNotEmpty()
  @IsString()
  merchantBankCode: string;

  @IsNotEmpty()
  @IsString()
  merchantAccountNumber: string;

  @IsNotEmpty()
  @IsString()
  merchantName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1000, { message: 'Amount must be at least 1,000 VND' })
  amountVnd: number;
}
