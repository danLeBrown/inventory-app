import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  NestModule,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';
import { Redis } from 'ioredis';

@Injectable()
export class HeaderCsrfMiddleware implements NestMiddleware {
  private readonly keyPrefix = 'csrf:';

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis, // Inject your existing Redis client
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const method = req.method;
    const url = req.originalUrl;

    // Skip for safe methods and excluded routes
    if (
      ['GET', 'HEAD', 'OPTIONS'].includes(method) ||
      url.endsWith('/csrf-token')
    ) {
      return next();
    }

    const sessionId = req.headers['x-session-id'] as string;
    const providedToken = req.headers['x-csrf-token'] as string;

    if (!sessionId) {
      throw new HttpException('Missing session ID', HttpStatus.BAD_REQUEST);
    }

    if (!providedToken) {
      throw new HttpException('Missing CSRF token', HttpStatus.FORBIDDEN);
    }

    try {
      const storedToken = await this.redis.get(`${this.keyPrefix}${sessionId}`);

      if (!storedToken) {
        throw new HttpException(
          'Invalid or expired CSRF token',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!this.verifyToken(providedToken, storedToken)) {
        throw new HttpException('Invalid CSRF token', HttpStatus.FORBIDDEN);
      }

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'CSRF validation failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private verifyToken(providedToken: string, storedToken: string): boolean {
    // Both tokens should be 64 hex characters (32 bytes)
    if (
      !this.isValidHex(providedToken, 64) ||
      !this.isValidHex(storedToken, 64)
    ) {
      return false;
    }
    return crypto.timingSafeEqual(
      Buffer.from(providedToken, 'hex'),
      Buffer.from(storedToken, 'hex'),
    );
  }

  private isValidHex(str: string, expectedLength: number): boolean {
    return (
      typeof str === 'string' &&
      str.length === expectedLength &&
      /^[0-9a-fA-F]+$/.test(str)
    );
  }

  async generateToken(sessionId: string): Promise<string> {
    // Generate a cryptographically secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Store in Redis with TTL (24 hours)
    await this.redis.setex(
      `${this.keyPrefix}${sessionId}`,
      24 * 60 * 60,
      token,
    );

    return token;
  }
}

@Module({
  providers: [HeaderCsrfMiddleware],
  exports: [HeaderCsrfMiddleware],
})
export class HeaderCsrfModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HeaderCsrfMiddleware).forRoutes('*');
  }
}
