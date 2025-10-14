import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get isLocal(): boolean {
    return this.nodeEnv === 'local';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get jwtConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      expiresIn: this.getNumber('JWT_EXPIRES_IN'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  get throttleConfig() {
    return {
      ttl: this.getNumber('THROTTLE_TTL'),
      limit: this.getNumber('THROTTLE_LIMIT'),
    };
  }

  //   get sentryConfig() {
  //     return {
  //       dsn: this.getString('SENTRY_DSN'),
  //       debug: this.getBoolean('ENABLE_SENTRY_DEBUG'),
  //       environment: this.nodeEnv,
  //       logLevel: this.getString('SENTRY_LOG_LEVEL'),
  //       enableTracing: true,
  //       integrations: [
  //         // enable HTTP calls tracing
  //         new Sentry.Integrations.Http({ tracing: true }),
  //         // enable Express.js middleware tracing
  //         new Sentry.Integrations.Express(),

  //         // since we use typeorm, we'll need to setup tracing manually
  //         // new Sentry.Integrations.Mysql(),
  //       ],

  //       tracesSampleRate: this.nodeEnv === 'live' ? 0.1 : 1, // Lower in production
  //       profilesSampleRate: this.nodeEnv === 'live' ? 0.1 : 1, // Lower in production
  //     };
  //   }

  private getNumber(key: string): number {
    const value = this.get<number>(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get<string>(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get<string>(key);

    return value.split('\\n').join('\n');
  }

  public get<T>(key: string): T | string {
    const value = this.configService.get<T>(key);

    return value ?? '';
  }

  isAuditLogsDisabled(): boolean {
    return this.getString('AUDIT_LOGS_ENABLED') === 'false';
  }
}
