import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateWithdrawDto {
  @ApiProperty({
    example: '1f720d99-6364-4e97-b04c-17a258108666',
  })
  @IsUUID()
  @IsNotEmpty()
  gatewayAccountId: string;

  @ApiProperty({
    example: 10000,
  })
  @IsInt()
  @Min(1)
  amount: number;

  @ApiProperty({
    example: '00020126580014br.gov.bcb.pix...',
  })
  @IsString()
  @IsNotEmpty()
  pixKey: string;

  @ApiProperty({
    example: 'Saque para conta pessoal',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'SAQUE-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalReference?: string;

  @ApiProperty({
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  document: string;
}