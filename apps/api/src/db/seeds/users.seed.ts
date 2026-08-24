import { DataSource } from 'typeorm';
import { User } from '@kamusi/database';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);

  console.log('Seeding admin user...');

  // Use environment variable for admin password, or generate a random one
  const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(16).toString('hex');
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
  console.log('------------------------------------------------------------');
  console.log('✅ Admin user created successfully');
  console.log(`Username: admin`);
  console.log(`Password: ${adminPassword}`);
  console.log('⚠️  SAVE THIS PASSWORD IMMEDIATELY. It will not be shown again.');
  console.log('------------------------------------------------------------');
}
