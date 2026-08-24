"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var SecretsValidatorMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecretsValidatorMiddleware = void 0;
const common_1 = require("@nestjs/common");
let SecretsValidatorMiddleware = SecretsValidatorMiddleware_1 = class SecretsValidatorMiddleware {
    constructor() {
        this.logger = new common_1.Logger(SecretsValidatorMiddleware_1.name);
    }
    use(req, res, next) {
        if (process.env.NODE_ENV === 'production') {
            const forbiddenDefaults = {
                JWT_SECRET: 'secret',
                DB_PASSWORD: 'password',
                DB_USER: 'postgres',
            };
            for (const [key, defaultValue] of Object.entries(forbiddenDefaults)) {
                if (process.env[key] === defaultValue || !process.env[key]) {
                    this.logger.error(`CRITICAL: Production environment detected but ${key} is using a default or missing value!`);
                    throw new common_1.InternalServerErrorException('Server configuration error');
                }
            }
        }
        next();
    }
};
exports.SecretsValidatorMiddleware = SecretsValidatorMiddleware;
exports.SecretsValidatorMiddleware = SecretsValidatorMiddleware = SecretsValidatorMiddleware_1 = __decorate([
    (0, common_1.Injectable)()
], SecretsValidatorMiddleware);
