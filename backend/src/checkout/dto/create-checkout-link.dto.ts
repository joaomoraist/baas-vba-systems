import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CheckoutLinkStatus } from '../../database/entities/checkout-link.entity';

export class CreateCheckoutLinkDto {
  @ApiProperty({
    example: 5000,
    description: 'Valor em centavos. R$ 50,00 = 5000.',
  })
  @IsInt()
  @IsPositive()
  amount: number;

  @ApiProperty({
    enum: CheckoutLinkStatus,
    example: CheckoutLinkStatus.PIX,
  })
  @IsEnum(CheckoutLinkStatus)
  method: CheckoutLinkStatus;

  @ApiProperty({
    example: 'PEDIDO-12345',
    description: 'Referência externa para conciliação.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  externalReference: string;

  @ApiProperty({
    example: 'uuid-da-gateway-account',
    description: 'ID da conta do gateway utilizada.',
  })
  @IsString()
  @IsNotEmpty()
  gatewayAccountId: string;

  @ApiPropertyOptional({
    example: 'VISA',
    description: 'Bandeira do cartão. Obrigatório para CARD.',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Quantidade de parcelas. Obrigatório para CARD.',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  installments?: number;
}