import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './configure-app';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  configureApp(app);

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

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
