import { IsNotEmpty, IsUUID, IsString, Length, Matches } from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsUUID(4, { message: 'quoteId must be a valid UUID v4' })
  quoteId: string;

  @IsNotEmpty()
  @IsString()
  @Length(6, 6, { message: 'PIN must be exactly 6 digits' })
  @Matches(/^[0-9]+$/, { message: 'PIN must contain only numbers' })
  pin: string;
}
