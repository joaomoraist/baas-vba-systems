import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayLoginDto } from './dto/gateway-login.dto';
import { GatewayRegisterDto } from './dto/gateway-register.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  // Endpoint to get fees
  @Get('fees')
  async getFees() {
    return this.gatewayService.getFees();
  }

  // Login endpoint
  @Post('login')
  @ApiOperation({ summary: 'Realiza o login do lojista no gateway' })
  async login(@Body() loginDto: GatewayLoginDto) {
    return this.gatewayService.login(loginDto);
  }

  // Register endpoint
  @Post('register')
  @ApiOperation({ summary: 'Realiza o cadastro do lojista no gateway' })
  async register(@Body() registerDto: GatewayRegisterDto) {
    return this.gatewayService.registerUser(registerDto);
}
}