import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CANONICAL_LANGUAGE, PartOfSpeech } from '@kamusi/core';
import { DictionaryEntriesService } from '../../src/dictionary-entries/dictionary-entries.service';
import { Example, Lemma, LemmaContribution, LemmaReport, LemmaRevision, Sense } from '@kamusi/database';
import { createMockCache, createMockRepository } from '../helpers/mock-repositories';
import { validCreateDto } from '../helpers/phase1-fixtures';

describe('DictionaryEntriesService — Phase 1', () => {
  let service: DictionaryEntriesService;
  let lemmaRepo: ReturnType<typeof createMockRepository>;
  let senseRepo: ReturnType<typeof createMockRepository>;
  let contributionRepo: ReturnType<typeof createMockRepository>;
  let revisionRepo: ReturnType<typeof createMockRepository>;
  let reportRepo: ReturnType<typeof createMockRepository>;
  let mockCache: ReturnType<typeof createMockCache>;

  beforeEach(async () => {
    lemmaRepo = createMockRepository();
    senseRepo = createMockRepository();
    contributionRepo = createMockRepository();
    revisionRepo = createMockRepository();
    reportRepo = createMockRepository();
    mockCache = createMockCache();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DictionaryEntriesService,
        { provide: getRepositoryToken(Lemma), useValue: lemmaRepo },
        { provide: getRepositoryToken(Sense), useValue: senseRepo },
        { provide: getRepositoryToken(Example), useValue: createMockRepository() },
        { provide: getRepositoryToken(LemmaContribution), useValue: contributionRepo },
        { provide: getRepositoryToken(LemmaRevision), useValue: revisionRepo },
        { provide: getRepositoryToken(LemmaReport), useValue: reportRepo },
        { provide: CACHE_MANAGER, useValue: mockCache },
      ],
    }).compile();

    service = module.get(DictionaryEntriesService);
  });

  describe('create', () => {
    it('creates a Swahili lemma with senses, contribution, and revision', async () => {
      lemmaRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 1,
          word: 'gari',
          language: CANONICAL_LANGUAGE,
          version: 1,
          senses: [{ definition: 'Chombo cha usafiri.' }],
          contributions: [{ action: 'created' }],
          revisions: [{ version: 1 }],
        });

      const dto = validCreateDto();
      const result = await service.create(dto, 42);

      expect(lemmaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          word: 'gari',
          language: CANONICAL_LANGUAGE,
          part_of_speech: PartOfSpeech.NOUN,
          plural: 'magari',
          synonyms: ['motokaa'],
          derived_words: ['dereva'],
          dialect: 'Kiswahili sanifu',
          source: 'test',
          creator_id: 42,
          is_verified: false,
          version: 1,
        }),
      );
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'created', user_id: 42 }),
      );
      expect(revisionRepo.save).toHaveBeenCalled();
      expect(result.word).toBe('gari');
    });

    it('rejects create without senses', async () => {
      await expect(
        service.create(validCreateDto({ senses: [] }), 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects empty Swahili definition', async () => {
      await expect(
        service.create(
          validCreateDto({ senses: [{ definition: '   ' }] }),
          1,
        ),
      ).rejects.toThrow('Each sense must have a non-empty Swahili definition');
    });

    it('rejects incomplete single-word English gloss', async () => {
      await expect(
        service.create(validCreateDto({ senses: [{ definition: 'car' }] }), 1),
      ).rejects.toThrow('Definition looks incomplete');
    });

    it('rejects duplicate (word, part_of_speech)', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({ id: 99, word: 'gari' });

      await expect(service.create(validCreateDto(), 1)).rejects.toThrow(
        ConflictException,
      );
    });

    it('allows same word with different part of speech', async () => {
      lemmaRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          id: 2,
          word: 'piga',
          part_of_speech: PartOfSpeech.VERB,
          language: CANONICAL_LANGUAGE,
          senses: [],
          contributions: [],
          revisions: [],
        });

      const result = await service.create(
        validCreateDto({
          word: 'piga',
          partOfSpeech: PartOfSpeech.VERB,
          senses: [{ definition: 'Kupiga kitu kwa nguvu.' }],
        }),
        1,
      );

      expect(result.word).toBe('piga');
    });
  });

  describe('update', () => {
    const existingLemma = {
      id: 1,
      creator_id: 10,
      language: CANONICAL_LANGUAGE,
      version: 1,
      is_verified: true,
      senses: [{ definition: 'Maana ya zamani.', examples: [] }],
    };

    it('allows creator to update and bumps version', async () => {
      lemmaRepo.findOne
        .mockResolvedValueOnce({ ...existingLemma })
        .mockResolvedValueOnce({
          ...existingLemma,
          version: 2,
          is_verified: false,
          contributions: [],
          revisions: [],
        });

      const result = await service.update(
        1,
        { senses: [{ definition: 'Maana mpya ya Kiswahili.' }] },
        10,
        'contributor',
      );

      expect(lemmaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ version: 2, is_verified: false }),
      );
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'updated' }),
      );
      expect(result.version).toBe(2);
    });

    it('allows moderator to update another users entry', async () => {
      lemmaRepo.findOne
        .mockResolvedValueOnce({ ...existingLemma, creator_id: 99 })
        .mockResolvedValueOnce({ ...existingLemma, creator_id: 99, version: 2 });

      await service.update(
        1,
        { dialect: 'Kimvita' },
        5,
        'moderator',
      );

      expect(lemmaRepo.save).toHaveBeenCalled();
    });

    it('forbids non-owner contributor from updating', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        ...existingLemma,
        creator_id: 99,
      });

      await expect(
        service.update(1, { source: 'bad' }, 10, 'contributor'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('soft-deletes for owner and records contribution', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        creator_id: 10,
        is_verified: false,
        is_hidden: false,
      });

      const result = await service.delete(1, 10, 'contributor');

      expect(lemmaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_hidden: true }),
      );
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'deleted' }),
      );
      expect(result).toEqual({ deleted: true, soft: true });
    });

    it('forbids contributor from deleting verified entry', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        creator_id: 10,
        is_verified: true,
      });

      await expect(service.delete(1, 10, 'contributor')).rejects.toThrow(
        'You cannot delete verified entries',
      );
    });

    it('allows moderator to delete verified entry', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        creator_id: 10,
        is_verified: true,
        is_hidden: false,
      });

      await service.delete(1, 99, 'moderator');
      expect(lemmaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_hidden: true }),
      );
    });

    it('forbids non-owner contributor from deleting', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        creator_id: 99,
        is_verified: false,
      });

      await expect(service.delete(1, 10, 'contributor')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('moderate', () => {
    it('requires moderator role', async () => {
      await expect(
        service.moderate(1, 'verify', 1, 'contributor'),
      ).rejects.toThrow('Moderator role required');
    });

    it('verifies lemma and records contribution', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        is_verified: false,
        is_hidden: false,
      });

      const result = await service.moderate(1, 'verify', 5, 'moderator');

      expect(lemmaRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ is_verified: true, is_hidden: false }),
      );
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'verified' }),
      );
      expect(result.is_verified).toBe(true);
    });

    it('hides and restores lemma', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({ id: 1, is_hidden: false });
      await service.moderate(1, 'hide', 5, 'admin');
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'hidden' }),
      );

      lemmaRepo.findOne.mockResolvedValueOnce({ id: 1, is_hidden: true });
      await service.moderate(1, 'restore', 5, 'admin');
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'restored' }),
      );
    });

    it('throws when lemma not found', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce(null);
      await expect(
        service.moderate(404, 'verify', 5, 'moderator'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('bulkModerate', () => {
    it('requires moderator role', async () => {
      await expect(
        service.bulkModerate([1, 2], 'verify', 1, 'contributor'),
      ).rejects.toThrow('Moderator role required');
    });

    it('verifies multiple lemmas and records contributions', async () => {
      lemmaRepo.findOne
        .mockResolvedValueOnce({ id: 1, is_verified: false, is_hidden: false })
        .mockResolvedValueOnce({ id: 2, is_verified: false, is_hidden: false });

      const result = await service.bulkModerate([1, 2], 'verify', 5, 'moderator');

      expect(result).toEqual({
        action: 'verify',
        total: 2,
        applied: 2,
        results: [
          { id: 1, status: 'ok' },
          { id: 2, status: 'ok' },
        ],
      });
      expect(lemmaRepo.save).toHaveBeenCalledTimes(2);
      expect(contributionRepo.save).toHaveBeenCalledTimes(2);
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'verified' }),
      );
    });

    it('reports not-found ids without failing the batch', async () => {
      lemmaRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 2, is_hidden: true });

      const result = await service.bulkModerate([404, 2], 'restore', 5, 'admin');

      expect(result.applied).toBe(1);
      expect(result.results).toEqual([
        { id: 404, status: 'not_found' },
        { id: 2, status: 'ok' },
      ]);
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'restored' }),
      );
    });

    it('rejects empty ids', async () => {
      await expect(
        service.bulkModerate([], 'verify', 5, 'moderator'),
      ).rejects.toThrow('At least one entry id is required');
    });
  });

  describe('report', () => {
    const existingLemma = { id: 1, creator_id: 10, is_verified: true, is_hidden: false };

    it('creates a report, increments report_count, and records contribution', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({ ...existingLemma });
      reportRepo.findOne.mockResolvedValueOnce(null);

      const result = await service.report(1, 42, { reason: 'spam', note: ' Uchafu ' });

      expect(reportRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          lemma_id: 1,
          user_id: 42,
          reason: 'spam',
          note: 'Uchafu',
          status: 'open',
        }),
      );
      expect(lemmaRepo.increment).toHaveBeenCalledWith({ id: 1 }, 'report_count', 1);
      expect(contributionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'reported', note: 'spam' }),
      );
      expect(mockCache.clear).toHaveBeenCalled();
      expect(result.status).toBe('open');
    });

    it('forbids reporting your own entry', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({ ...existingLemma, creator_id: 42 });

      await expect(
        service.report(1, 42, { reason: 'other' }),
      ).rejects.toThrow('You cannot report your own entry');
    });

    it('forbids duplicate report from the same user', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({ ...existingLemma });
      reportRepo.findOne.mockResolvedValueOnce({ id: 7, status: 'open' });

      await expect(
        service.report(1, 42, { reason: 'spam' }),
      ).rejects.toThrow(ConflictException);
    });

    it('throws NotFound when lemma does not exist', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce(null);

      await expect(
        service.report(404, 42, { reason: 'wrong' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('report resolution on moderation', () => {
    it('verifying a reported entry resolves open reports and resets the count', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        is_verified: false,
        is_hidden: false,
        report_count: 2,
      });

      const result = await service.moderate(1, 'verify', 5, 'moderator');

      expect(reportRepo.update).toHaveBeenCalledWith(
        { lemma_id: 1, status: 'open' },
        { status: 'resolved' },
      );
      expect(lemmaRepo.update).toHaveBeenCalledWith(
        { id: 1 },
        { report_count: 0 },
      );
      expect(result.report_count).toBe(0);
    });

    it('hiding a reported entry also resolves reports', async () => {
      lemmaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        is_hidden: false,
        report_count: 1,
      });

      await service.moderate(1, 'hide', 5, 'moderator');

      expect(reportRepo.update).toHaveBeenCalledWith(
        { lemma_id: 1, status: 'open' },
        { status: 'resolved' },
      );
    });
  });

  describe('search', () => {
    it('returns cached results without hitting database', async () => {
      mockCache.get.mockResolvedValueOnce([{ word: 'gari' }]);

      const result = await service.search({ q: 'gari' });

      expect(result).toEqual([{ word: 'gari' }]);
      expect(lemmaRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('queries only visible Swahili lemmas when cache miss', async () => {
      mockCache.get.mockResolvedValueOnce(null);

      await service.search({ q: 'gari', page: 1, limit: 10 });

      const qb = lemmaRepo.createQueryBuilder.mock.results[0].value;
      expect(qb.andWhere).toHaveBeenCalledWith('lemma.is_hidden = false');
      expect(qb.andWhere).toHaveBeenCalledWith('lemma.language = :lang', {
        lang: CANONICAL_LANGUAGE,
      });
      expect(mockCache.set).toHaveBeenCalled();
    });

    it('queries Swahili lemmas including hidden when cache miss (moderation search)', async () => {
      mockCache.get.mockResolvedValueOnce(null);

      await service.searchModeration({ q: 'gari', page: 1, limit: 10 });

      const qb = lemmaRepo.createQueryBuilder.mock.results[0].value;

      expect(qb.andWhere).not.toHaveBeenCalledWith('lemma.is_hidden = false');
      expect(qb.andWhere).toHaveBeenCalledWith('lemma.language = :lang', {
        lang: CANONICAL_LANGUAGE,
      });
      expect(mockCache.set).toHaveBeenCalled();
    });
  });
});
