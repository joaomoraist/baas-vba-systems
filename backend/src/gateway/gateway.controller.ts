import { Body, Controller, Get, Post, Param, NotFoundException, } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { GatewayLoginDto } from './dto/gateway-login.dto';
import { GatewayRegisterDto } from './dto/gateway-register.dto';
import { ApiOperation } from '@nestjs/swagger';
import { RegisterWebhooksDto } from './dto/register-webhooks.dto';

@Controller('gateway')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('fees/:gatewayAccountId')
  async getFees(
  @Param('gatewayAccountId') gatewayAccountId: string,) 
  {
  const gatewayAccount =
    await this.gatewayService.findGatewayAccount(
      gatewayAccountId,
    );

  if (!gatewayAccount) {
    throw new NotFoundException(
      'Conta do Gateway não encontrada.',
    );
  }

  return this.gatewayService.getFees(gatewayAccount);
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

  // Register webhooks endpoint
  @Post('webhooks')
  @ApiOperation({
    summary: 'Cadastra os webhooks no Gateway',
  })
  async registerWebhooks(
    @Body() body: RegisterWebhooksDto,
  ) {
    const gatewayAccount =
      await this.gatewayService.findGatewayAccount(
        body.gatewayAccountId,
      );

    if (!gatewayAccount) {
      throw new NotFoundException(
        'Conta do Gateway não encontrada.',
      );
    }

    const baseUrl = body.url.replace(/\/$/, '');

    const webhooks = [
      {
        event: 'PAYMENT_PIX',
        url: `${baseUrl}/webhooks/payment-pix`,
      },
      {
        event: 'PAYMENT_CARD',
        url: `${baseUrl}/webhooks/payment-card`,
      },
      {
        event: 'WITHDRAWAL',
        url: `${baseUrl}/webhooks/withdrawal`,
      },
    ];

    const results: any[] = [];

    for (const webhook of webhooks) {
      const result =
        await this.gatewayService.registerWebhook(
          gatewayAccount,
          webhook.event,
          webhook.url,
          body.secret,
        );

      results.push({
        event: webhook.event,
        url: webhook.url,
        result,
      });
    }

    return {
      message: 'Webhooks cadastrados com sucesso.',
      webhooks: results,
    };
  }
}