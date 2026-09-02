import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { SecretsValidatorMiddleware } from './middleware/secrets-validator.middleware';

@Module({})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecretsValidatorMiddleware)
      .forRoutes('{*path}');
  }
}
