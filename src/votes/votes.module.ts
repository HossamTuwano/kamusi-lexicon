import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationVote } from './entities/vote.entity';
import { VotesService } from './votes.service';
import { VotesController } from './votes.controller';
import { DictionaryEntriesModule } from '../dictionary-entries/dictionary-entries.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationVote]),
    DictionaryEntriesModule,
    UsersModule,
  ],
  providers: [VotesService],
  controllers: [VotesController],
})
export class VotesModule {}
