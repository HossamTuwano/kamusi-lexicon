import { describe, it, expect } from 'vitest';
import {
  CANONICAL_LANGUAGE,
  PartOfSpeech,
  type CreateLemmaInput,
} from '@kamusi/core';

/**
 * Guards the shared canonical model against Phase 1 drift.
 * If these fail, fix packages/core before touching the API.
 */
describe('@kamusi/core — Phase 1 contract', () => {
  it('locks canonical language to Swahili', () => {
    expect(CANONICAL_LANGUAGE).toBe('sw');
  });

  it('defines lexical part-of-speech codes for structured entries', () => {
    expect(PartOfSpeech.NOUN).toBe('N');
    expect(PartOfSpeech.VERB).toBe('T');
    expect(Object.keys(PartOfSpeech).length).toBeGreaterThanOrEqual(8);
  });

  it('CreateLemmaInput requires Swahili senses, not translations', () => {
    const input: CreateLemmaInput = {
      word: 'gari',
      partOfSpeech: PartOfSpeech.NOUN,
      senses: [{ definition: 'Chombo cha usafiri.', examples: [] }],
      synonyms: ['motokaa'],
    };

    expect(input.language).toBeUndefined();
    expect(input.senses[0].definition).toMatch(/Chombo/);
  });
});
