import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreatePixPaymentDto {
  @IsInt()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  payerDocument: string;

  @IsString()
  @IsNotEmpty()
  externalReference: string;
}