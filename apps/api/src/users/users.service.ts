import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, LemmaContribution } from '@kamusi/database';
import { UserRole } from '@kamusi/core';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(LemmaContribution)
    private contributionRepo: Repository<LemmaContribution>,
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

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ order: { id: 'ASC' } });
  }

  /**
   * Promote/demote a user. Guards:
   * - actor cannot change their own role (prevents accidental self-lockout)
   * - the last admin cannot be demoted
   */
  async updateRole(
    id: number,
    role: UserRole,
    actorId: number,
  ): Promise<User> {
    if (id === actorId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await this.userRepository.count({
        where: { role: 'admin' },
      });
      if (adminCount <= 1) {
        throw new BadRequestException('Cannot demote the last admin');
      }
    }

    user.role = role;
    return this.userRepository.save(user);
  }

  async updateReputation(userId: number, delta: number): Promise<void> {
    await this.userRepository.increment({ id: userId }, 'reputation_score', delta);
  }

  async getMyContributions(userId: number, status?: string) {
    const query = this.contributionRepo
      .createQueryBuilder('contribution')
      .leftJoinAndSelect('contribution.lemma', 'lemma')
      .where('contribution.user_id = :userId', { userId });

    if (status) {
      query.andWhere('contribution.status = :status', { status });
    }

    return query.orderBy('contribution.created_at', 'DESC').getMany();
  }
}
