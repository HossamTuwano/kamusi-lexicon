"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api');
    // Global Validation
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    // Swagger Configuration
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Kamusi API')
        .setDescription('Crowdsourced Dictionary API (Dict.cc Clone)')
        .setVersion('1.0')
        .addServer('http://localhost:3001')
        .addBearerAuth()
        .build();
    const documents = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, documents);
    await app.listen(3001);
}
bootstrap();
