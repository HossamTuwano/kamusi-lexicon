import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { configureApp } from '../../src/configure-app';

export class E2ETestSetup {
  public app: INestApplication;
  public serverHttp: request.SuperTest<request.Test> = request(null);
  public dataSource: DataSource;

  async withAppModule(): Promise<this> {
    const { AppModule } = await import('../../src/app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    this.app = moduleFixture.createNestApplication();
    configureApp(this.app);
    await this.app.init();
    this.serverHttp = request(this.app.getHttpServer());
    this.dataSource = moduleFixture.get<DataSource>(DataSource);
    await this.dataSource.query('CREATE EXTENSION IF NOT EXISTS pg_trgm');

    return this;
  }

  async cleanup(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.target);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
    }
  }

  async teardown(): Promise<void> {
    if (this.app) {
      await this.app.close();
    }
  }
}
