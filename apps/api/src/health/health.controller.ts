import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { createClient } from 'redis';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async check() {
    try {
      // 1. Check Database
      await this.dataSource.query('SELECT 1');

      // 2. Check Redis (Ephemeral check)
      const redisClient = createClient();
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
    } catch (error) {
      // Return a 503 Service Unavailable if health check fails
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
}
