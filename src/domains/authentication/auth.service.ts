import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { addSeconds, getUnixTime } from 'date-fns';

import { AppConfigService } from '@/app-configs/app-config.service';

import { validateHash } from '../../helpers/hash.helper';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { IJWTPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private appConfigService: AppConfigService,
  ) {}

  async login(dto: LoginDto, ip_address?: string, user_agent?: string) {
    const user = await this.userService.findOneBy({
      email: dto.email,
    });

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    if (!(await validateHash(dto.password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }
    return new LoginResponseDto(user, {
      access_token: await this.generateAccessToken(user),
      refresh_token: await this.generateRefreshToken(
        user,
        ip_address,
        user_agent,
      ),
    });
  }

  private async generateAccessToken(user: Pick<User, 'id' | 'is_admin'>) {
    return this.jwtService.signAsync({
      sub: user.id,
      role: user.is_admin ? 'admin' : 'user',
      type: 'access',
    });
  }

  private async generateRefreshToken(
    user: Pick<User, 'id' | 'is_admin'>,
    ip_address?: string,
    user_agent?: string,
  ) {
    const refresh_token = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.is_admin ? 'admin' : 'user',
        type: 'refresh',
      },
      {
        expiresIn: Number(this.appConfigService.get('JWT_REFRESH_EXPIRES_IN')),
      },
    );

    await this.userService.createSession({
      user_id: user.id,
      refresh_token,
      ip_address,
      user_agent,
      expired_at: getUnixTime(
        addSeconds(
          new Date(),
          Number(this.appConfigService.get('JWT_REFRESH_EXPIRES_IN')),
        ),
      ),
    });

    return refresh_token;
  }

  async refreshToken(
    refresh_token: string,
    ip_address?: string,
    user_agent?: string,
  ) {
    const payload = await this.jwtService
      .verifyAsync(refresh_token)
      .catch((error) => {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token expired');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token');
        }
        throw new UnauthorizedException('Invalid token');
      });

    const user = await this.userService.findOneBy({
      id: payload.sub,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const session = await this.userService.sessionRepo.findOne({
      where: {
        refresh_token,
        user_id: user.id,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }

    if (session.expired_at < getUnixTime(new Date())) {
      throw new UnauthorizedException('Token expired');
    }

    await this.userService.sessionRepo.update(session.id, {
      ip_address,
      user_agent,
    });

    return new LoginResponseDto(user, {
      access_token: await this.generateAccessToken(user),
      refresh_token,
    });
  }

  async authUser(token: string) {
    const payload: IJWTPayload = await this.jwtService.verifyAsync(token);

    const user = await this.userService.findOneBy({
      id: payload.sub,
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user.toDto();
  }
}
