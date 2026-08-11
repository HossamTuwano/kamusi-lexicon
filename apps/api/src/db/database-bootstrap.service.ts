import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Ensures Phase 1 Postgres extensions exist (TypeORM sync does not create them). */
@Injectable()
export class DatabaseBootstrapService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
  }
}
