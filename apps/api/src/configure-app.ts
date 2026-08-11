import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CamelCaseInterceptor } from './common/interceptors/camel-case.interceptor';

/**
 * Shared Nest app wiring for runtime + e2e so wire-format stays identical.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new CamelCaseInterceptor());
}
