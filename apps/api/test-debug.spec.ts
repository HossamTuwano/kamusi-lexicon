import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import request from 'supertest';
import { PartOfSpeech } from '@kamusi/core';

async function testCreate() {
  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  configureApp(app);
  await app.init();
  const serverHttp = request(app.getHttpServer());
  const dataSource = moduleFixture.get('DataSource');

  // Create test user
  await dataSource.query(
    'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4)',
    ['testuser', 'test@test.com', 'hash', 'contributor']
  );
  
  const loginRes = await serverHttp
    .post('/api/auth/login')
    .send({ username: 'testuser', password: 'testpass' });
  
  console.log('Login response:', loginRes.status, loginRes.body);
  
  const createRes = await serverHttp
    .post('/api/entries')
    .set('Authorization', `Bearer ${loginRes.body.accessToken || loginRes.body.access_token}`)
    .send({
      word: 'gari',
      partOfSpeech: 'noun',
      senses: [{
        definition: 'Test definition',
        examples: []
      }]
    });
  
  console.log('Create response:', createRes.status);
  console.log('Create body:', JSON.stringify(createRes.body, null, 2));

  await app.close();
}

testCreate().catch(console.error);
