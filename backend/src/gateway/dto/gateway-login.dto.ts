import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GatewayLoginDto {
  @ApiProperty({example: '12345678901',}) // Documento (CPF) do usuário
  @IsString()
  @IsNotEmpty()
  document: string;

  @ApiProperty({example: '123456',}) // Senha do usuário
  @IsString()
  @Length(6)
  password: string;
}