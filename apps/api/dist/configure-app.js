"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureApp = configureApp;
const common_1 = require("@nestjs/common");
const camel_case_interceptor_1 = require("./common/interceptors/camel-case.interceptor");
/**
 * Shared Nest app wiring for runtime + e2e so wire-format stays identical.
 */
function configureApp(app) {
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.useGlobalInterceptors(new camel_case_interceptor_1.CamelCaseInterceptor());
}
