"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const configure_app_1 = require("./configure-app");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    (0, configure_app_1.configureApp)(app);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Kamusi API')
        .setDescription('Open Swahili lexical API — Phase 1 monolingual Kamusi (Swahili → Swahili). ' +
        'Translations are out of scope until Phase 2. JSON wire format is camelCase.')
        .setVersion('1.0')
        .addServer('http://localhost:3001')
        .addBearerAuth()
        .build();
    const documents = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, documents);
    await app.listen(3001);
}
bootstrap();
