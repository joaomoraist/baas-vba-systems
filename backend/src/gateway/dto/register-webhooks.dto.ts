import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class RegisterWebhooksDto {
  @ApiProperty({
    example: 'seu-uuid-aqui',
  })
  @IsUUID()
  gatewayAccountId: string;

  @ApiProperty({
    example: 'http://localhost:3000/webhooks',
  })
  @IsString()
  url: string;

  @ApiProperty({
    example: 'seu-segredo-aqui',
    required: false,
  })
  @IsOptional()
  @IsString()
  secret?: string;
}