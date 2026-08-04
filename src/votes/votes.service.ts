import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VerificationVote } from './entities/vote.entity';
import { DictionaryEntry } from '../dictionary-entries/entities/dictionary-entry.entity';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ForbiddenException, ConflictException } from '@nestjs/common';

@Injectable()
export class VotesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(VerificationVote) private voteRepo: Repository<VerificationVote>,
    @InjectRepository(DictionaryEntry) private entryRepo: Repository<DictionaryEntry>,
    private usersService: UsersService,
  ) {}

  async vote(entryId: number, userId: number, voteType: number) {
    if (voteType !== 1 && voteType !== -1) throw new BadRequestException('Vote must be 1 or -1');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entry = await queryRunner.manager.findOne(DictionaryEntry, { where: { id: entryId } });
      if (!entry) throw new NotFoundException();

      if (entry.creatorId === userId) {
        throw new ForbiddenException('You cannot vote for your own entry');
      }

      await queryRunner.manager.insert(VerificationVote, {
        entry_id: entryId,
        user_id: userId,
        vote_type: voteType,
      });

      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update(DictionaryEntry)
        .set({ vote_count: () => `vote_count + ${voteType}` })
        .where('id = :id', { id: entryId })
        .returning(['vote_count', 'is_verified'])
        .execute();

      const updatedEntry = updateResult.raw[0];
      const newVoteCount = updatedEntry.vote_count;

      if (newVoteCount >= 5 && !updatedEntry.is_verified) {
        await queryRunner.manager.update(DictionaryEntry, entryId, { is_verified: true });
        await this.usersService.updateReputation(entry.creatorId, 10);
      } else if (newVoteCount <= -3) {
        await queryRunner.manager.update(DictionaryEntry, entryId, { is_hidden: true });
      }

      await queryRunner.commitTransaction();
      return { vote_count: newVoteCount, is_verified: updatedEntry.is_verified };
    } catch (e: any) {
      await queryRunner.rollbackTransaction();
      if (e.code === '23505') throw new ConflictException('You have already voted on this entry');
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async removeVote(entryId: number, userId: number) {
    const result = await this.voteRepo.delete({ entry_id: entryId, user_id: userId });
    if (result.affected === 0) throw new NotFoundException('Vote not found');
  }
}
