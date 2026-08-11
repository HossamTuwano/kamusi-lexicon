import { DataSource } from 'typeorm';
import { PartOfSpeech } from '@kamusi/core';
import { Lemma } from '../../src/dictionary-entries/entities/lemma.entity';
import { Sense } from '../../src/dictionary-entries/entities/sense.entity';
import { Example } from '../../src/dictionary-entries/entities/example.entity';

export class LemmaFactory {
  constructor(private dataSource: DataSource) {}

  async create(overrides: Partial<Lemma> = {}): Promise<Lemma> {
    const lemmaRepo = this.dataSource.getRepository(Lemma);
    const senseRepo = this.dataSource.getRepository(Sense);
    const exampleRepo = this.dataSource.getRepository(Example);

    const lemma = lemmaRepo.create({
      word: 'test-word',
      language: 'sw',
      part_of_speech: PartOfSpeech.NOUN,
      is_verified: false,
      synonyms: [],
      antonyms: [],
      derived_words: [],
      version: 1,
      ...overrides,
    });

    const savedLemma = await lemmaRepo.save(lemma);

    const sense = senseRepo.create({
      definition: 'Ufafanuzi wa majaribio.',
      lemma_id: savedLemma.id,
    });
    const savedSense = await senseRepo.save(sense);

    await exampleRepo.save(
      exampleRepo.create({
        sentence: 'Hii ni sentensi ya majaribio.',
        sense_id: savedSense.id,
      }),
    );

    savedLemma.senses = [savedSense];

    return savedLemma;
  }

  async createMany(count: number, overrides: Partial<Lemma> = {}): Promise<Lemma[]> {
    const results = [];
    for (let i = 0; i < count; i++) {
      results.push(
        await this.create({ ...overrides, word: `${overrides.word || 'test'}-${i}` }),
      );
    }
    return results;
  }
}
