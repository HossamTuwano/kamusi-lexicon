import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { PartOfSpeech } from '@kamusi/core';
import { DictionaryEntriesController } from '../../src/dictionary-entries/dictionary-entries.controller';
import { DictionaryEntriesService } from '../../src/dictionary-entries/dictionary-entries.service';

describe('DictionaryEntriesController — Phase 1', () => {
  let controller: DictionaryEntriesController;
  let service: {
    search: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    moderate: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    service = {
      search: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      moderate: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DictionaryEntriesController],
      providers: [{ provide: DictionaryEntriesService, useValue: service }],
    }).compile();

    controller = module.get(DictionaryEntriesController);
  });

  describe('search', () => {
    it('returns empty array when query is blank (Phase 1 public search)', async () => {
      expect(await controller.search({ q: '' })).toEqual([]);
      expect(await controller.search({ q: '   ' })).toEqual([]);
      expect(service.search).not.toHaveBeenCalled();
    });

    it('delegates to service when query present', async () => {
      const dto = { q: 'gari' };
      await controller.search(dto);
      expect(service.search).toHaveBeenCalledWith(dto);
    });
  });

  describe('create', () => {
    it('passes Swahili dto and authenticated user to service', async () => {
      const dto = {
        word: 'gari',
        partOfSpeech: PartOfSpeech.NOUN,
        senses: [{ definition: 'Chombo cha usafiri.' }],
      };
      const req = { user: { userId: 7, role: 'contributor' } };

      await controller.create(dto, req);

      expect(service.create).toHaveBeenCalledWith(dto, 7);
    });
  });

  describe('update / delete / moderate', () => {
    it('passes role on update', async () => {
      const req = { user: { userId: 1, role: 'moderator' } };
      await controller.update('3', { dialect: 'Kimvita' }, req);
      expect(service.update).toHaveBeenCalledWith(3, { dialect: 'Kimvita' }, 1, 'moderator');
    });

    it('passes role on delete', async () => {
      const req = { user: { userId: 1, role: 'contributor' } };
      await controller.remove('2', req);
      expect(service.delete).toHaveBeenCalledWith(2, 1, 'contributor');
    });

    it('passes role on moderate', async () => {
      const req = { user: { userId: 9, role: 'admin' } };
      await controller.moderate('4', 'verify', req);
      expect(service.moderate).toHaveBeenCalledWith(4, 'verify', 9, 'admin');
    });
  });
});
