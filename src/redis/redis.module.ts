import { Global, Module } from '@nestjs/common';
import { Redis } from 'ioredis';

const redisProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const url = new URL(process.env.REDIS_URL || 'redis://localhost:6379');

    return new Redis({
      host: url.hostname,
      port: url.port ? Number(url.port) : 6379,
      password: url.password,
      username: url.username,
      // Add other Redis config as needed
    });
  },
};

@Global()
@Module({
  providers: [redisProvider],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
