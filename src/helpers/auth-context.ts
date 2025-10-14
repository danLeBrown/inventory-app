import { getValue, setValue } from 'express-ctx';

import { AuthUserDto } from '@/domains/authentication/dto/auth-user.dto';

export class RequestContextProvider {
  private static namespace = 'request';

  private static get<T>(key: string): T | undefined {
    return getValue<T>(RequestContextProvider.getKeyWithNamespace(key));
  }

  private static set(key: string, value: unknown): void {
    setValue(RequestContextProvider.getKeyWithNamespace(key), value);
  }

  private static getKeyWithNamespace(key: string): string {
    return `${RequestContextProvider.namespace}.${key}`;
  }

  static setAuthUser(user?: AuthUserDto): void {
    RequestContextProvider.set('user', user);
  }

  static getAuthUser(): AuthUserDto | undefined {
    return RequestContextProvider.get<AuthUserDto>('user');
  }
}
