import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EntryItem } from './EntryItem';
import { ApiLemma } from '../lib/api';

const mockLemma: ApiLemma = {
  id: 1,
  word: 'gari',
  language: 'sw',
  partOfSpeech: 'N',
  pronunciation: 'ga-ri',
  plural: 'magari',
  synonyms: [],
  antonyms: [],
  derivedWords: [],
  dialect: null,
  source: 'manual',
  isVerified: true,
  voteCount: 10,
  isHidden: false,
  creatorId: 1,
  createdAt: '2026-01-01T00:00:00Z',
  version: 1,
  reportCount: 0,
  senses: [
    {
      id: 10,
      definition: 'Chombo cha usafiri chenye magurudumu',
      usageNote: 'Inatumika zaidi mjini',
      lemmaId: 1,
      examples: [
        {
          id: 100,
          sentence: 'Gari linaenda kasi',
          note: 'Mfano wa kawaida',
          senseId: 10,
        },
      ],
    },
  ],
};

describe('EntryItem', () => {
  it('renders the lemma word and part of speech correctly', () => {
    render(
      <MemoryRouter>
        <EntryItem lemma={mockLemma} />
      </MemoryRouter>
    );

    expect(screen.getByText('gari')).toBeInTheDocument();
    // Note: PartOfSpeechLabels is imported from @kamusi/core, 
    // we check if the raw label or the mapped label is present.
    expect(screen.getByText(/N/i)).toBeInTheDocument();
  });

  it('renders all senses and their definitions', () => {
    render(
      <MemoryRouter>
        <EntryItem lemma={mockLemma} />
      </MemoryRouter>
    );

    expect(screen.getByText('Chombo cha usafiri chenye magurudumu')).toBeInTheDocument();
  });

  it('renders examples for each sense', () => {
    render(
      <MemoryRouter>
        <EntryItem lemma={mockLemma} />
      </MemoryRouter>
    );

    expect(screen.getByText('Gari linaenda kasi')).toBeInTheDocument();
  });

  it('handles lemmas with no senses gracefully', () => {
    const emptyLemma = { ...mockLemma, senses: [] };
    render(
      <MemoryRouter>
        <EntryItem lemma={emptyLemma} />
      </MemoryRouter>
    );

    // Should not crash and should render the word
    expect(screen.getByText('gari')).toBeInTheDocument();
  });
});
