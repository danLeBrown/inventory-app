import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { getUnixTime } from 'date-fns';
import { FindOptionsWhere, Not, Repository } from 'typeorm';

import { CreateUserDto, UpdateUserDto } from './dto/create-user.dto';
import { SearchAndPaginateUserDto } from './dto/query-and-paginate-user.dto';
import { User } from './entities/user.entity';
import { UserSession } from './entities/user-session.entity';
import { IUserCreatedEvent } from './events';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    public repo: Repository<User>,
    @InjectRepository(UserSession)
    public sessionRepo: Repository<UserSession>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateUserDto) {
    const { role_id, ...rest } = dto;

    if (!rest.is_admin && role_id) {
      throw new BadRequestException(
        'Non-admin users cannot have a role assigned',
      );
    }

    const emailExists = await this.repo.exists({
      where: {
        email: rest.email,
      },
    });

    if (emailExists) {
      throw new BadRequestException('User already exists with this email');
    }

    const phoneExists = await this.repo.exists({
      where: {
        phone_number: rest.phone_number,
      },
    });

    if (phoneExists) {
      throw new BadRequestException(
        'User already exists with this phone number',
      );
    }

    const user = await this.repo.save(this.repo.create(rest));

    await this.eventEmitter.emitAsync('user.created', {
      user,
      role_id,
    } satisfies IUserCreatedEvent);

    return this.findOneByOrFail({ id: user.id });
  }

  async searchAndFindBy(query: SearchAndPaginateUserDto) {
    const {
      search_query,
      from_time,
      to_time,
      status,
      is_admin,
      limit = 0,
      page = 0,
      order_by = 'created_at',
      order_direction = 'desc',
    } = query;

    const qb = this.repo.createQueryBuilder('user');

    if (search_query) {
      qb.where(
        'LOWER(user.first_name) LIKE :search_query OR LOWER(user.last_name) LIKE :search_query',
      )
        .orWhere('LOWER(user.email) LIKE :search_query')
        .orWhere('user.phone_number LIKE :search_query')
        .orWhere('user.status LIKE :search_query')
        .setParameter('search_query', `%${search_query.toLowerCase()}%`);
    }

    if (status) {
      qb.andWhere('user.status = :status', { status });
    }

    if (is_admin) {
      qb.andWhere('user.is_admin = :is_admin', { is_admin });
    }

    if (from_time) {
      qb.andWhere('user.created_at >= :from_time', {
        from_time: getUnixTime(new Date(from_time * 1000)),
      });
    }

    if (to_time) {
      qb.andWhere('user.created_at <= :to_time', {
        to_time: getUnixTime(new Date(to_time * 1000)),
      });
    }

    return qb
      .orderBy(
        order_by === 'name' ? 'user.first_name' : 'user.created_at',
        order_direction.toUpperCase() as 'ASC' | 'DESC',
      )
      .take(limit > 0 ? limit : undefined)
      .skip(page && limit ? (page - 1) * limit : undefined)
      .getManyAndCount();
  }

  async findOneBy(query: FindOptionsWhere<User>) {
    return this.repo.findOne({
      where: query,
    });
  }

  async findOneByOrFail(query: FindOptionsWhere<User>) {
    const user = await this.findOneBy(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOneByOrFail({ id });

    if (dto.email) {
      const exists = await this.repo.exists({
        where: {
          email: dto.email,
          id: Not(id), // Ensure the email is not already used by another user
        },
      });

      if (exists) {
        throw new BadRequestException('Email already in use');
      }
    }

    if (dto.phone_number) {
      const exists = await this.repo.exists({
        where: {
          phone_number: dto.phone_number,
          id: Not(id), // Ensure the phone_number is not already used by another user
        },
      });

      if (exists) {
        throw new BadRequestException('Phone number already in use');
      }
    }

    return this.repo.update(id, dto);
  }

  async createSession(dto: {
    user_id: string;
    ip_address?: string;
    user_agent?: string;
    refresh_token: string;
    expired_at: number;
  }) {
    return this.sessionRepo.save(
      this.sessionRepo.create({
        ...dto,
        login_at: getUnixTime(new Date()),
      }),
    );
  }

  async findSessionBy(query: FindOptionsWhere<UserSession>) {
    return this.sessionRepo.findOne({
      where: query,
    });
  }
}
