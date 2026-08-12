import { DataSource } from 'typeorm';
import { User } from '@kamusi/database';
import * as bcrypt from 'bcrypt';

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  console.log('Seeding admin user...');

  const adminPassword = 'admin123'; // Default credentials
  const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await userRepo.findOne({ where: { username: 'admin' } });
  if (existingAdmin) {
    console.log('Admin user already exists, skipping...');
    return;
  }

  const admin = userRepo.create({
    username: 'admin',
    email: 'admin@kamusi.local',
    password_hash: adminHashedPassword,
    role: 'admin',
    reputation_score: 100,
  });

  await userRepo.save(admin);
  console.log(`✓ Admin user created (username: admin, password: ${adminPassword})`);
}
