import { Injectable, NestMiddleware, InternalServerErrorException, Logger } from '@nestjs/common';

@Injectable()
export class SecretsValidatorMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecretsValidatorMiddleware.name);

  use(req: any, res: any, next: () => void) {
    if (process.env.NODE_ENV === 'production') {
      const forbiddenDefaults = {
        JWT_SECRET: 'secret',
        DB_PASSWORD: 'password',
        DB_USER: 'postgres',
      };

      for (const [key, defaultValue] of Object.entries(forbiddenDefaults)) {
        if (process.env[key] === defaultValue || !process.env[key]) {
          this.logger.error(`CRITICAL: Production environment detected but ${key} is using a default or missing value!`);
          throw new InternalServerErrorException('Server configuration error');
        }
      }
    }
    next();
  }
}
