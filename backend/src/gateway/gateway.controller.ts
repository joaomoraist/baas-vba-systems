import { Body, Controller, Get, Post } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayLoginDto } from './dto/gateway-login.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('fees')
  async getFees() {
    return this.gatewayService.getFees();
  }

  @Post('login')
  async login(@Body() loginDto: GatewayLoginDto) {
    return this.gatewayService.login(loginDto);
  }
}