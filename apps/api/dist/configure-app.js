"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const camel_case_interceptor_1 = require("./common/interceptors/camel-case.interceptor");
/**
 * Shared Nest app wiring for runtime + e2e so wire-format stays identical.
 */
function configureApp(app) {
    const corsOrigins = (process.env.CORS_ORIGINS ||
        'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
        optionsSuccessStatus: 204,
    });
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
            excludeExtraneousValues: false,
            exposeDefaultValues: true,
        },
    }));
    app.useGlobalInterceptors(new camel_case_interceptor_1.CamelCaseInterceptor());
}
