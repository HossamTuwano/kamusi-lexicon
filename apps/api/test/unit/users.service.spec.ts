import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@kamusi/database';
import { UsersService } from '../../src/users/users.service';
import { createMockRepository } from '../helpers/mock-repositories';

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof createMockRepository>;

  beforeEach(async () => {
    userRepo = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get(UsersService);
  });

  describe('create', () => {
    it('hashes the password before persisting', async () => {
      await service.create('alice', 'a@kamusi.test', 'secret123');

      expect(userRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'alice',
          email: 'a@kamusi.test',
          password_hash: expect.not.stringMatching('secret123'),
        }),
      );
      expect(userRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateRole', () => {
    it('promotes a contributor to moderator', async () => {
      userRepo.findOne.mockResolvedValueOnce({
        id: 2,
        username: 'bob',
        role: 'contributor',
      });

      const result = await service.updateRole(2, 'moderator', 1);

      expect(result.role).toBe('moderator');
      expect(userRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'moderator' }),
      );
    });

    it('forbids changing your own role', async () => {
      await expect(service.updateRole(1, 'moderator', 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws when user not found', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);

      await expect(service.updateRole(999, 'moderator', 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('blocks demoting the last admin', async () => {
      userRepo.findOne.mockResolvedValueOnce({
        id: 2,
        username: 'root',
        role: 'admin',
      });
      userRepo.count.mockResolvedValueOnce(1);

      await expect(service.updateRole(2, 'moderator', 1)).rejects.toThrow(
        'Cannot demote the last admin',
      );
    });

    it('allows demoting an admin when another admin remains', async () => {
      userRepo.findOne.mockResolvedValueOnce({
        id: 2,
        username: 'root',
        role: 'admin',
      });
      userRepo.count.mockResolvedValueOnce(2);

      const result = await service.updateRole(2, 'moderator', 1);

      expect(result.role).toBe('moderator');
    });

    it('never demotes an admin by name collision on count without admin role', async () => {
      // contributor target: role change should not hit admin-count guard
      userRepo.findOne.mockResolvedValueOnce({
        id: 3,
        username: 'carl',
        role: 'contributor',
      });
      userRepo.count.mockResolvedValue(0);

      const result = await service.updateRole(3, 'moderator', 1);
      expect(result.role).toBe('moderator');
      expect(userRepo.count).not.toHaveBeenCalled();
    });
  });
});
