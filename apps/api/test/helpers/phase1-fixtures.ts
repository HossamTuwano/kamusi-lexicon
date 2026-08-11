import { PartOfSpeech } from '@kamusi/core';
import { CreateEntryDto } from '../../src/dictionary-entries/dto/entry.dto';

/** Valid Phase 1 create payload — Swahili definition required. */
export function validCreateDto(
  overrides: Partial<CreateEntryDto> = {},
): CreateEntryDto {
  return {
    word: 'gari',
    partOfSpeech: PartOfSpeech.NOUN,
    plural: 'magari',
    synonyms: ['motokaa'],
    derivedWords: ['dereva'],
    dialect: 'Kiswahili sanifu',
    source: 'test',
    senses: [
      {
        definition: 'Chombo cha usafiri kinachotumika kubeba watu au mizigo.',
        usageNote: 'Matumizi ya kawaida.',
        examples: [{ sentence: 'Nimenunua gari jipya.', note: 'Mfano' }],
      },
    ],
    ...overrides,
  };
}
