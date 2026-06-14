import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyPinDto {
  @IsString()
  @IsNotEmpty({ message: 'PIN is required' })
  @Length(6, 6, { message: 'PIN must be exactly 6 digits' })
  @Matches(/^\d+$/, { message: 'PIN must contain only numbers' })
  pin: string;
}
