import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Production safety check
  if (process.env.NODE_ENV === 'production') {
    const insecureSecret = 'supersecretkey';
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === insecureSecret) {
      console.error('CRITICAL SECURITY ERROR: Production mode detected, but JWT_SECRET is missing or using the default insecure key.');
      console.error('Please set a secure JWT_SECRET in your environment variables.');
      process.exit(1);
    }

    if (process.env.DB_SYNC === 'true') {
      console.error('CRITICAL DATA RISK: DB_SYNC is enabled in production mode.');
      console.error('This can cause accidental data loss. Set DB_SYNC=false and use migrations.');
      process.exit(1);
    }
  }

  configureApp(app);

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Kamusi API')
      .setDescription(
        'Open Swahili lexical API — Phase 1 monolingual Kamusi (Swahili → Swahili). ' +
          'Translations are out of scope until Phase 2. JSON wire format is camelCase.',
      )
      .setVersion('1.0')
      .addServer('http://localhost:3001')
      .addBearerAuth()
      .build();
    const documents = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, documents);
  }

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
