import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { CheckoutService } from './checkout.service';
import { CreateCheckoutLinkDto } from './dto/create-checkout-link.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkoutService: CheckoutService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Cria um novo link de checkout',
  })
  @ApiResponse({
    status: 201,
    description: 'Link de checkout criado com sucesso.',
  })
  async createCheckoutLink(
    @Body() dto: CreateCheckoutLinkDto,
  ) {
    return this.checkoutService.createCheckoutLink(dto);
  }
}