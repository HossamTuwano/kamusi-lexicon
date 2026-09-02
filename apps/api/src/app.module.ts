import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DictionaryEntriesModule } from './dictionary-entries/dictionary-entries.module';
import { VotesModule } from './votes/votes.module';
import { DatabaseBootstrapService } from './db/database-bootstrap.service';
import { HealthModule } from './health/health.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL') || config.get<string>('DB_URL');
        const dbSsl = config.get<string>('DB_SSL');
        const useSsl = dbSsl === 'true' || (databaseUrl && dbSsl !== 'false');

        const connectionConfig = databaseUrl
          ? { url: databaseUrl }
          : {
              host: config.get<string>('DB_HOST', 'localhost'),
              port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
              username: config.get<string>('DB_USER', 'postgres'),
              password: config.get<string>('DB_PASSWORD', 'postgres'),
              database: config.get<string>('DB_NAME', 'kamusi_dev'),
            };

        return {
          type: 'postgres',
          ...connectionConfig,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: config.get<string>('NODE_ENV') === 'production'
            ? false
            : config.get<string>('DB_SYNC') === 'true',
        };
      },
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL');
        const redisHost = config.get<string>('REDIS_HOST');
        const ttl = 60 * 60 * 1000; // 1 hour

        if (redisUrl || redisHost) {
          try {
            const store = await redisStore({
              url: redisUrl || undefined,
              socket: !redisUrl && redisHost ? {
                host: redisHost,
                port: parseInt(config.get<string>('REDIS_PORT', '6379'), 10),
              } : undefined,
              ttl,
            });
            return { store: store as any, ttl };
          } catch (err) {
            console.error('Failed to initialize Redis store, falling back to in-memory store:', err);
            return { ttl };
          }
        }
        return { ttl };
      },
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 10,   // 10 requests per minute per IP
    }]),
    AuthModule,
    UsersModule,
    DictionaryEntriesModule,
    VotesModule,
    HealthModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DatabaseBootstrapService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
