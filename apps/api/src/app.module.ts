import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DictionaryEntriesModule } from './dictionary-entries/dictionary-entries.module';
import { VotesModule } from './votes/votes.module';
import { DatabaseBootstrapService } from './db/database-bootstrap.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      // Prefer migrations in shared/staging/prod. Local/e2e may set DB_SYNC=true.
      // Apply schema via packages/database/sql/001_phase1_bootstrap.sql
      // or TypeORM CLI against src/db/migrations (do not glob .ts at runtime).
      synchronize: process.env.DB_SYNC === 'true',
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          socket: {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          ttl: 60 * 60 * 1000, // 1 hour
        }),
      }),
    }),
    AuthModule,
    UsersModule,
    DictionaryEntriesModule,
    VotesModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseBootstrapService],
})
export class AppModule {}
