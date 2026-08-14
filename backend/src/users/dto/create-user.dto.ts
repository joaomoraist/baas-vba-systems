import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'Nome e Sobrenome',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 'exemplo@email.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '11999999999',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiProperty({
    example: 'CPF ou CNPJ',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  document: string;

  @ApiProperty({
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}