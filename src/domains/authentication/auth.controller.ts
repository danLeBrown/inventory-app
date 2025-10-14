import { Body, Controller, Get, Headers, Ip, Post } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { AuditLog } from '../audit-logs/decorators/audit-log.decorator';
import { UnauthenticatedRoute } from '../authentication/decorators/unauthenticated.decorator';
import { UserDto } from '../users/dto/user.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller({
  version: '1',
  path: 'auth',
})
@AuditLog({ has_sensitive_record: true })
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOkResponse({
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @UnauthenticatedRoute()
  @AuditLog({
    model: 'User',
    action: 'User login',
  })
  @Post('login')
  async login(
    @Body()
    dto: LoginDto,
    @Ip()
    ip: string,
    @Headers('user-agent')
    userAgent: string,
  ) {
    return {
      data: await this.authService.login(dto, ip, userAgent),
    };
  }

  @ApiOkResponse({
    description: 'Refresh token successful',
    type: LoginResponseDto,
  })
  @UnauthenticatedRoute()
  @AuditLog({
    model: 'User',
    action: 'Refresh token',
  })
  @Post('refresh')
  async refresh(
    @Body()
    dto: RefreshTokenDto,
    @Ip()
    ip: string,
    @Headers('user-agent')
    userAgent: string,
  ) {
    return {
      data: await this.authService.refreshToken(
        dto.refresh_token,
        ip,
        userAgent,
      ),
    };
  }

  @ApiOkResponse({
    description: 'Authenticated user',
    type: UserDto,
  })
  @AuditLog({
    model: 'User',
    action: 'Get authenticated user',
  })
  @Get('user')
  async authUser(
    @Headers('Authorization')
    bearerToken: string,
  ) {
    return {
      data: await this.authService.authUser(bearerToken.replace('Bearer ', '')),
    };
  }
}
