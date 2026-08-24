import { DataSource } from 'typeorm';
import { PartOfSpeech } from '@kamusi/core';
import { Example, Lemma, Sense } from '@kamusi/database';

export async function seedDictionary(dataSource: DataSource) {
  const lemmaRepo = dataSource.getRepository(Lemma);
  const senseRepo = dataSource.getRepository(Sense);
  const exampleRepo = dataSource.getRepository(Example);

  console.log('Starting seeding process...');

  const gari = lemmaRepo.create({
    word: 'gari',
    language: 'sw',
    part_of_speech: PartOfSpeech.NOUN,
    plural: 'magari',
    synonyms: ['motokaa'],
    antonyms: [],
    derived_words: ['dereva', 'garini'],
    dialect: 'Kiswahili sanifu',
    source: 'seed',
    is_verified: true,
    vote_count: 10,
    version: 1,
  });
  const savedLemma = await lemmaRepo.save(gari);
  console.log(`Created Lemma: ${savedLemma.word}`);

  const sense1 = senseRepo.create({
    definition: 'Chombo cha usafiri kinachotumika kubeba watu au mizigo.',
    usage_note: 'Hutumika mara nyingi kwa magari ya kisasa.',
    lemma_id: savedLemma.id,
  });
  const savedSense1 = await senseRepo.save(sense1);

  const sense2 = senseRepo.create({
    definition: 'Kaa au gari la kubebea mizigo kwa kutumia wanyama.',
    usage_note: 'Matumizi ya kimila au maalum.',
    lemma_id: savedLemma.id,
  });
  const savedSense2 = await senseRepo.save(sense2);

  await exampleRepo.save(
    exampleRepo.create({
      sentence: 'Nimenunua gari jipya.',
      note: 'Matumizi ya kawaida',
      sense_id: savedSense1.id,
    }),
  );

  await exampleRepo.save(
    exampleRepo.create({
      sentence: 'Gari la kubeba mizigo limefika.',
      note: 'Matumizi ya muktadha',
      sense_id: savedSense2.id,
    }),
  );

  console.log('Seeding completed successfully!');
}
