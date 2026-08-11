import { describe, it, expect } from 'vitest';
import { toCamelCaseKeys } from '../../src/common/utils/case.util';

describe('toCamelCaseKeys', () => {
  it('maps nested snake_case lemma payloads to camelCase', () => {
    const result = toCamelCaseKeys({
      part_of_speech: 'noun',
      is_verified: false,
      derived_words: ['dereva'],
      senses: [{ usage_note: 'note', lemma_id: 1 }],
      access_token: 'abc',
    });

    expect(result).toEqual({
      partOfSpeech: 'noun',
      isVerified: false,
      derivedWords: ['dereva'],
      senses: [{ usageNote: 'note', lemmaId: 1 }],
      accessToken: 'abc',
    });
  });
});
