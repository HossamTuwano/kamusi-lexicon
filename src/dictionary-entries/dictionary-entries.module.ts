import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionaryEntry } from './entities/dictionary-entry.entity';
import { DictionaryEntriesService } from './dictionary-entries.service';
import { DictionaryEntriesController } from './dictionary-entries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DictionaryEntry])],
  providers: [DictionaryEntriesService],
  controllers: [DictionaryEntriesController],
  exports: [DictionaryEntriesService, TypeOrmModule],
})
export class DictionaryEntriesModule {}
