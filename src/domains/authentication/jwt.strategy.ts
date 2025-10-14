import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as Sentry from '@sentry/nestjs';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '@/app-configs/app-config.service';
import { RequestContextProvider } from '@/helpers/auth-context';

import { UsersService } from '../users/users.service';
import { AuthUserDto } from './dto/auth-user.dto';
import { IJWTPayload } from './interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: AppConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.jwtConfig.privateKey,
    });
  }

  async validate(payload: IJWTPayload) {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.userService.findOneBy({ id: payload.sub });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    Sentry.setUser({
      id: user.id,
      full_name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.is_admin ? 'admin' : 'user',
    });

    const authUser = AuthUserDto.create(user);

    // Set the auth user in the request context
    RequestContextProvider.setAuthUser(authUser);

    return authUser;
  }
}
