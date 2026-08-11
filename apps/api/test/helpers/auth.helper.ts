import request from 'supertest';
import { DataSource } from 'typeorm';
import { User } from '../../src/users/entities/user.entity';
import { E2ETestSetup } from '../builders/e2e-test-setup';

export interface TestAuth {
  username: string;
  token: string;
  userId: number;
}

export async function registerContributor(
  http: request.SuperTest<request.Test>,
  suffix = Date.now().toString(),
): Promise<TestAuth> {
  const username = `user_${suffix}`;
  const email = `${username}@kamusi.test`;
  const password = 'password123';

  const res = await http
    .post('/api/auth/register')
    .send({ username, email, password })
    .expect(201);

  return {
    username,
    token: res.body.accessToken,
    userId: res.body.user.id,
  };
}

export async function registerModerator(
  setup: E2ETestSetup,
  suffix = Date.now().toString(),
): Promise<TestAuth> {
  const auth = await registerContributor(setup.serverHttp, suffix);
  const userRepo = setup.dataSource.getRepository(User);
  await userRepo.update({ id: auth.userId }, { role: 'moderator' });

  const login = await setup.serverHttp
    .post('/api/auth/login')
    .send({ username: auth.username, password: 'password123' })
    .expect(201);

  return {
    ...auth,
    token: login.body.accessToken,
  };
}

export async function isInfraAvailable(setup: E2ETestSetup): Promise<boolean> {
  try {
    await setup.withAppModule();
    await setup.cleanup();
    return true;
  } catch {
    return false;
  }
}
