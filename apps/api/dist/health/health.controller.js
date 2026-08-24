"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const redis_1 = require("redis");
let HealthController = class HealthController {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async check() {
        try {
            // 1. Check Database
            await this.dataSource.query('SELECT 1');
            // 2. Check Redis (Ephemeral check)
            const redisClient = (0, redis_1.createClient)();
            await redisClient.connect();
            await redisClient.ping();
            await redisClient.disconnect();
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                services: {
                    database: 'up',
                    redis: 'up',
                },
            };
        }
        catch (error) {
            // Return a 503 Service Unavailable if health check fails
            throw new common_1.HttpException({
                status: 'error',
                timestamp: new Date().toISOString(),
                message: error.message,
                services: {
                    database: 'unknown',
                    redis: 'unknown',
                },
            }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthController.prototype, "check", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], HealthController);
