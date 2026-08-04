import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(username: string, email: string, pass: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(pass, 10);
    const user = this.userRepository.create({
      username,
      email,
      password_hash: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateReputation(userId: number, delta: number): Promise<void> {
    await this.userRepository.increment({ id: userId }, 'reputation_score', delta);
  }
}
