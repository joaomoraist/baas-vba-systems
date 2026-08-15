import {
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

import { GatewayLoginDto } from './dto/gateway-login.dto';
import { GatewayRegisterDto } from './dto/gateway-register.dto';

import { GatewayAccount } from '../database/entities/gateway-account.entity';
import { User } from '../database/entities/user.entity';

import { CreatePixPaymentDto } from './dto/create-pix-payment.dto';
import { CreateCardPaymentDto } from './dto/create-card-payment.dto';
import { CreateWithdrawDto } from '../withdrawal/dto/create-withdraw.dto';


@Injectable()
export class GatewayService {
  private readonly baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,

    @InjectRepository(GatewayAccount)
    private readonly gatewayAccountRepository: Repository<GatewayAccount>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    this.baseUrl =
      this.configService.getOrThrow<string>('GATEWAY_BASE_URL');
  }

  // Login no Gateway
  async login(loginDto: GatewayLoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          document: loginDto.document,
        },
      });

      if (!user) {
        throw new HttpException(
          'Usuário BaaS não encontrado.',
          HttpStatus.NOT_FOUND,
        );
      }

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/auth/login`,
          loginDto,
        ),
      );

      const accessToken =
        response.data?.access_token ||
        response.data?.token;

      const codigoCliente = response.data?.codigoCliente;
      const chaveLoja = response.data?.chaveLoja;

      if (!accessToken || !codigoCliente || !chaveLoja) {
        throw new HttpException(
          'Resposta de login do Gateway inválida.',
          HttpStatus.BAD_GATEWAY,
        );
      }

      let gatewayAccount =
        await this.gatewayAccountRepository.findOne({
          where: {
            userId: user.id,
          },
        });

      if (!gatewayAccount) {
        gatewayAccount =
          this.gatewayAccountRepository.create({
            userId: user.id,
            codigoCliente: String(codigoCliente),
            chaveLoja,
            accessToken,
          });
      } else {
        gatewayAccount.codigoCliente = String(codigoCliente);
        gatewayAccount.chaveLoja = chaveLoja;
        gatewayAccount.accessToken = accessToken;
      }

      // Salva no MySQL
      const savedGatewayAccount =
        await this.gatewayAccountRepository.save(
          gatewayAccount,
        );

      return {
        message: 'Login realizado com sucesso.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          document: user.document,
        },
        gatewayAccountId: savedGatewayAccount.id,
      };
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  // Cadastro de usuário no Gateway
  async registerUser(registerDto: GatewayRegisterDto) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/users`,
          registerDto,
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  // Consulta de taxas
  async getFees(gatewayAccount: GatewayAccount) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/fees`,
          {
            headers: this.getAuthHeaders(gatewayAccount),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  async findGatewayAccount(
    gatewayAccountId: string,
  ) {
    return this.gatewayAccountRepository.findOne({
      where: {
        id: gatewayAccountId,
      },
    });
  }

  async createPixPayment(
    gatewayAccount: GatewayAccount,
    dto: CreatePixPaymentDto,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payments/pix`,
          dto,
          {
            headers: this.getAuthHeaders(gatewayAccount),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  async createCardPayment(
    gatewayAccount: GatewayAccount,
    dto: CreateCardPaymentDto,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/payments/card`,
          dto,
          {
            headers: this.getAuthHeaders(gatewayAccount),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  async getGatewayAccount(gatewayAccountId: string) {
    const gatewayAccount =
      await this.gatewayAccountRepository.findOne({
        where: {
          id: gatewayAccountId,
        },
      });

    if (!gatewayAccount) {
      throw new HttpException(
        'Conta do Gateway não encontrada.',
        HttpStatus.NOT_FOUND,
      );
    }

    return gatewayAccount;
  }

  async registerWebhook(
    gatewayAccount: GatewayAccount,
    event: string,
    url: string,
    secret?: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/webhooks`,
          {
            event,
            url,
            secret,
          },
          {
            headers: this.getAuthHeaders(gatewayAccount),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  async createWithdrawal(
    gatewayAccount: GatewayAccount,
    dto: Omit<CreateWithdrawDto, 'gatewayAccountId'>,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/withdrawals`,
          dto,
          {
            headers: this.getAuthHeaders(
              gatewayAccount,
            ),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  async getWithdrawal(
    gatewayAccount: GatewayAccount,
    withdrawalId: string,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/withdrawals/${withdrawalId}`,
          {
            headers: this.getAuthHeaders(gatewayAccount),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  private getAuthHeaders(
    gatewayAccount: GatewayAccount,
  ) {
    if (!gatewayAccount.accessToken) {
      throw new HttpException(
        'Conta do Gateway não possui token de acesso.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      Authorization: `Bearer ${gatewayAccount.accessToken}`,
    };
  }

  // Tratamento de erros HTTP
  private handleHttpError(error: unknown): never {
    if (error instanceof AxiosError && error.response) {
      const status = error.response.status;
      const data = error.response.data;

      throw new HttpException(
        data?.message ||
          data ||
          'Erro na comunicação com o Gateway',
        status,
      );
    }

    if (error instanceof HttpException) {
      throw error;
    }

    throw new HttpException(
      'Falha de comunicação com o serviço do Gateway de Pagamento',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}