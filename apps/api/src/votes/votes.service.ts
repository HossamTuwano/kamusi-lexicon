import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Lemma, User, VerificationVote } from '@kamusi/database';
import { UsersService } from '../users/users.service';
import { ForbiddenException, ConflictException } from '@nestjs/common';

@Injectable()
export class VotesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(VerificationVote) private voteRepo: Repository<VerificationVote>,
    @InjectRepository(Lemma) private lemmaRepo: Repository<Lemma>,
    private usersService: UsersService,
  ) {}

  async vote(entryId: number, userId: number, voteType: number) {
    if (voteType !== 1 && voteType !== -1) throw new BadRequestException('Vote must be 1 or -1');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const lemma = await queryRunner.manager.findOne(Lemma, { where: { id: entryId } });
      if (!lemma) throw new NotFoundException();

      if (lemma.creator_id === userId) {
        throw new ForbiddenException('You cannot vote for your own entry');
      }

      await queryRunner.manager.insert(VerificationVote, {
        entry_id: entryId,
        user_id: userId,
        vote_type: voteType,
      });

      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update(Lemma)
        .set({ vote_count: () => `vote_count + ${voteType}` })
        .where('id = :id', { id: entryId })
        .returning(['vote_count', 'is_verified'])
        .execute();

      const updatedLemma = updateResult.raw[0];
      const newVoteCount = updatedLemma.vote_count;

      if (newVoteCount >= 5 && !updatedLemma.is_verified) {
        await queryRunner.manager.update(Lemma, entryId, { is_verified: true });
        await this.usersService.updateReputation(lemma.creator_id, 10);
      } else if (newVoteCount <= -3) {
        await queryRunner.manager.update(Lemma, entryId, { is_hidden: true });
      }

      await queryRunner.commitTransaction();
      return { vote_count: newVoteCount, is_verified: updatedLemma.is_verified };
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
