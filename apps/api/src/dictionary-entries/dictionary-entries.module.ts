import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lemma } from './entities/lemma.entity';
import { Sense } from './entities/sense.entity';
import { Example } from './entities/example.entity';
import { LemmaContribution } from './entities/lemma-contribution.entity';
import { LemmaRevision } from './entities/lemma-revision.entity';
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
    ]),
  ],
  providers: [DictionaryEntriesService],
  controllers: [DictionaryEntriesController],
  exports: [DictionaryEntriesService, TypeOrmModule],
})
export class DictionaryEntriesModule {}
