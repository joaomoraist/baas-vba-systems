import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
  IsOptional,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

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
    description: 'Método de pagamento.',
  })
  @IsEnum(CheckoutLinkStatus)
  method: CheckoutLinkStatus;

  @ApiProperty({
    example: 'Pagamento pedido #123',
    description: 'Descrição do pagamento.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description: string;

  @ApiProperty({
    example: '39840291040',
    description: 'CPF ou CNPJ do pagador.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  payerDocument: string;

  @ApiProperty({
    example: 'PEDIDO-12345',
    description: 'Referência externa para conciliação.',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  externalReference: string;

  @ApiProperty({
    example: '1f720d99-6364-4e97-b04c-17a258108666',
    description: 'ID da conta do Gateway utilizada.',
  })
  @IsString()
  @IsNotEmpty()
  gatewayAccountId: string;

  @ApiPropertyOptional({
    example: 'VISA',
    description: 'Obrigatório quando o método for CARD.',
  })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Obrigatório quando o método for CARD.',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  installments?: number;

  @ApiPropertyOptional({
  example: '4111111111111111',
  description: 'Número do cartão. Obrigatório quando o método for CARD.',
})
@IsOptional()
@IsString()
cardNumber?: string;

@ApiPropertyOptional({
  example: 'MARIA SILVA',
  description: 'Nome no cartão. Obrigatório quando o método for CARD.',
})
@IsOptional()
@IsString()
cardHolder?: string;

@ApiPropertyOptional({
  example: '12',
  description: 'Mês de validade. Obrigatório quando o método for CARD.',
})
@IsOptional()
@IsString()
expiryMonth?: string;

@ApiPropertyOptional({
  example: '2030',
  description: 'Ano de validade. Obrigatório quando o método for CARD.',
})
@IsOptional()
@IsString()
expiryYear?: string;

@ApiPropertyOptional({
  example: '123',
  description: 'CVV. Obrigatório quando o método for CARD.',
})
@IsOptional()
@IsString()
cvv?: string;
}