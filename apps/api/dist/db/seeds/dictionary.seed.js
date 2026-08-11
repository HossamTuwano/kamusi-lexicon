"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDictionary = seedDictionary;
const lemma_entity_1 = require("../../dictionary-entries/entities/lemma.entity");
const sense_entity_1 = require("../../dictionary-entries/entities/sense.entity");
const example_entity_1 = require("../../dictionary-entries/entities/example.entity");
async function seedDictionary(dataSource) {
    const lemmaRepo = dataSource.getRepository(lemma_entity_1.Lemma);
    const senseRepo = dataSource.getRepository(sense_entity_1.Sense);
    const exampleRepo = dataSource.getRepository(example_entity_1.Example);
    console.log('🌱 Starting seeding process...');
    // 1. Create Lemma
    const gari = lemmaRepo.create({
        word: 'gari',
        language: 'sw',
        part_of_speech: lemma_entity_1.PartOfSpeech.NOUN,
        plural: 'magari',
        is_verified: true,
        vote_count: 10,
    });
    const savedLemma = await lemmaRepo.save(gari);
    console.log(`✅ Created Lemma: ${savedLemma.word}`);
    // 2. Create Senses
    const sense1 = senseRepo.create({
        definition: 'Chombo cha usafiri kinachotumika kubeba watu au mizigo.',
        usage_note: 'Commonly used for modern vehicles.',
        lemma_id: savedLemma.id,
    });
    const savedSense1 = await senseRepo.save(sense1);
    console.log(`✅ Created Sense 1 for ${savedLemma.word}`);
    const sense2 = senseRepo.create({
        definition: 'Kaa au gari la kubebea mizigo kwa kutumia wanyama.',
        usage_note: 'More traditional or specific contexts.',
        lemma_id: savedLemma.id,
    });
    const savedSense2 = await senseRepo.save(sense2);
    console.log(`✅ Created Sense 2 for ${savedLemma.word}`);
    // 3. Create Examples
    const example1 = exampleRepo.create({
        sentence: 'Nimenunua gari jipya.',
        note: 'Standard usage',
        sense_id: savedSense1.id,
    });
    await exampleRepo.save(example1);
    const example2 = exampleRepo.create({
        sentence: 'Gari la kubeba mizigo limefika.',
        note: 'Contextual usage',
        sense_id: savedSense2.id,
    });
    await exampleRepo.save(example2);
    console.log('🚀 Seeding completed successfully!');
}
