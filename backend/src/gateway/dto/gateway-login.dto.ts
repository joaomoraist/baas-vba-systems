import { IsNotEmpty, IsString, Length } from 'class-validator';

export class GatewayLoginDto {
  @IsString()
  @IsNotEmpty()
  document: string;

  @IsString()
  @Length(6)
  password: string;
}