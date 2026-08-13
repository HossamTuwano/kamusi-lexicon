import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Example, Lemma, LemmaContribution, LemmaReport, LemmaRevision, Sense } from '@kamusi/database';
import { DictionaryEntriesService } from './dictionary-entries.service';
import { DictionaryEntriesController } from './dictionary-entries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lemma,
      Sense,
      Example,
      LemmaContribution,
      LemmaRevision,
      LemmaReport,
    ]),
  ],
  providers: [DictionaryEntriesService],
  controllers: [DictionaryEntriesController],
  exports: [DictionaryEntriesService, TypeOrmModule],
})
export class DictionaryEntriesModule {}
