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

@Injectable()
export class GatewayService {
  private readonly baseUrl: string;
  private token: string | null = null;

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
    // 1. Procurar o usuário local do BaaS
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

    // 2. Fazer login no Gateway
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

    // 3. Mantém o token disponível para as chamadas atuais
    this.token = accessToken;

    // 4. Verifica se o usuário já possui uma conta Gateway
    let gatewayAccount =
      await this.gatewayAccountRepository.findOne({
        where: {
          userId: user.id,
        },
      });

    // 5. Se não existir, cria
    if (!gatewayAccount) {
      gatewayAccount =
        this.gatewayAccountRepository.create({
          userId: user.id,
          codigoCliente: String(codigoCliente),
          chaveLoja: chaveLoja,
          accessToken: accessToken,
        });
    } else {
      // 6. Se já existir, atualiza
      gatewayAccount.codigoCliente = String(codigoCliente);
      gatewayAccount.chaveLoja = chaveLoja;
      gatewayAccount.accessToken = accessToken;
    }

    // 7. Salva no MySQL
    await this.gatewayAccountRepository.save(
      gatewayAccount,
    );

    return response.data;
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
  async getFees() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.baseUrl}/fees`,
          {
            headers: this.getAuthHeaders(),
          },
        ),
      );

      return response.data;
    } catch (error) {
      this.handleHttpError(error);
    }
  }

  // Headers de autenticação
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

    throw new HttpException(
      'Falha de comunicação com o serviço do Gateway de Pagamento',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}