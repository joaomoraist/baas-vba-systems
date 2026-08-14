import {
  ConflictException,
  Injectable,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from '../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    const existingUser =
      await this.userRepository.findOne({
        where: [
          { email: dto.email },
          { document: dto.document },
        ],
      });

    if (existingUser) {
      throw new ConflictException(
        'E-mail ou documento já cadastrado.',
      );
    }

    const passwordHash = await bcrypt.hash(
      dto.password,
      10,
    );

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      document: dto.document,
      passwordHash,
    });

    const savedUser =
      await this.userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
      phone: savedUser.phone,
      document: savedUser.document,
      createdAt: savedUser.createdAt,
    };
  }
}