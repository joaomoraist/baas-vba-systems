import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { GatewayLoginDto } from './dto/gateway-login.dto';
import { GatewayRegisterDto } from './dto/gateway-register.dto';

@Injectable()
export class GatewayService {
  private readonly baseUrl: string;
  private token: string | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
  }

  // Login
  async login(loginDto: GatewayLoginDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/auth/login`,
          loginDto,
        ),
      );

      this.token = response.data?.access_token || response.data?.token || response.data;

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  // Register
  async registerUser(registerDto: GatewayRegisterDto) {
  try {
    const response = await firstValueFrom(
      this.httpService.post(`${this.baseUrl}/users`, registerDto),
    );
    return response.data;
  } catch (error) {
    this.handleHttpError(error);
  }
}

  async getFees() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/fees`, {
          headers: this.getAuthHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  private getAuthHeaders() {
    if (!this.token) {
      throw new HttpException(
        'Gateway não autenticado. Faça login primeiro.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      Authorization: `Bearer ${this.token}`,
    };
  }

  private handleHttpError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      throw new HttpException(
        data?.message || data || 'Erro na comunicação com o Gateway',
        status,
      );
    }

    throw new HttpException(
      'Falha de comunicação com o serviço do Gateway de Pagamento',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}