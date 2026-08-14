import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class GatewayRegisterDto {

    @ApiProperty({ example: 'Seu Nome',}) // Nome do usuário
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Seu_email@gmail.com',}) // Email do usuário
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '12345678901',}) // Documento (CPF) do usuário
    @IsString()
    @IsNotEmpty()
    document: string;

    @ApiProperty({ example: '11999999999',}) // Telefone do usuário
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiProperty({ example: 'PF', enum: ['PF', 'PJ'] })
    @IsString()
    @IsNotEmpty()
    personType: 'PF' | 'PJ';

    // CAMPOS EXIGIDOS PELO GATEWAY

    @ApiProperty({ example: '06763040' })
    @IsString()
    @Length(8, 8, { message: 'zipCode deve ter 8 dígitos' })
    zipCode: string;

    @ApiProperty({ example: 'Rua Exemplo' })
    @IsString()
    address: string;

    @ApiProperty({ example: '123' })
    @IsString()
    number: string;

    @ApiProperty({ example: 'Centro' })
    @IsString()
    neighborhood: string;

    @ApiProperty({ example: 'Taboão da Serra' })
    @IsString()
    city: string;

    @ApiProperty({ example: 'SP' })
    @IsString()
    @Length(2, 2, { message: 'state deve ser UF com 2 letras' })
    state: string;

}