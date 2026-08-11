import {
  describe,
  it,
  expect,
  beforeAll,
  beforeEach,
  afterAll,
} from 'vitest';
import { PartOfSpeech } from '@kamusi/core';
import { E2ETestSetup } from '../builders/e2e-test-setup';
import { LemmaFactory } from '../factories/lemma.factory';
import { registerContributor, registerModerator } from '../helpers/auth.helper';
import { validCreateDto } from '../helpers/phase1-fixtures';

const runE2E = process.env.RUN_E2E === '1';

describe.skipIf(!runE2E)('Phase 1 — Dictionary E2E', () => {
  let setup: E2ETestSetup;
  let lemmaFactory: LemmaFactory;

  beforeAll(async () => {
    setup = new E2ETestSetup();
    await setup.withAppModule();
    lemmaFactory = new LemmaFactory(setup.dataSource);
  });

  beforeEach(async () => {
    await setup.cleanup();
  });

  afterAll(async () => {
    await setup.teardown();
  });

  describe('public read', () => {
    it('searches Swahili lemmas with full Lemma → Sense → Example hierarchy', async () => {
      await lemmaFactory.create({ word: 'meza' });

      const response = await setup.serverHttp
        .get('/api/entries/search')
        .query({ q: 'meza' })
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].word).toBe('meza');
      expect(response.body[0].language).toBe('sw');
      expect(response.body[0].partOfSpeech).toBe(PartOfSpeech.NOUN);
      expect(response.body[0].senses).toHaveLength(1);
      expect(response.body[0].senses[0].definition).toBe('Ufafanuzi wa majaribio.');
      expect(response.body[0].senses[0].examples?.length).toBeGreaterThan(0);
    });

    it('returns empty array for unknown query', async () => {
      const response = await setup.serverHttp
        .get('/api/entries/search')
        .query({ q: 'hakuna-neno' })
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('excludes hidden lemmas from search', async () => {
      await lemmaFactory.create({ word: 'fichwa', is_hidden: true });

      const response = await setup.serverHttp
        .get('/api/entries/search')
        .query({ q: 'fichwa' })
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('returns lemma with contributions and revisions by id', async () => {
      const lemma = await lemmaFactory.create({ word: 'kitabu' });

      const response = await setup.serverHttp
        .get(`/api/entries/${lemma.id}`)
        .expect(200);

      expect(response.body.word).toBe('kitabu');
      expect(response.body.senses).toBeDefined();
      expect(response.body.isVerified).toBe(false);
    });
  });

  describe('authenticated create', () => {
    it('creates a monolingual Swahili entry with metadata', async () => {
      const auth = await registerContributor(setup.serverHttp);

      const response = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(validCreateDto({ word: 'gari' }))
        .expect(201);

      expect(response.body.word).toBe('gari');
      expect(response.body.language).toBe('sw');
      expect(response.body.partOfSpeech).toBe(PartOfSpeech.NOUN);
      expect(response.body.synonyms).toContain('motokaa');
      expect(response.body.derivedWords).toContain('dereva');
      expect(response.body.senses[0].definition).toMatch(/Chombo/);
      expect(response.body.senses[0].usageNote).toBe('Matumizi ya kawaida.');
      expect(response.body.contributions?.some((c: { action: string }) => c.action === 'created')).toBe(true);
      expect(response.body.revisions?.length).toBeGreaterThan(0);
    });

    it('rejects unauthenticated create', async () => {
      await setup.serverHttp
        .post('/api/entries')
        .send(validCreateDto())
        .expect(401);
    });

    it('rejects create without Swahili senses', async () => {
      const auth = await registerContributor(setup.serverHttp);

      await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ word: 'bila', partOfSpeech: PartOfSpeech.NOUN, senses: [] })
        .expect(400);
    });

    it('rejects duplicate (word, part_of_speech)', async () => {
      const auth = await registerContributor(setup.serverHttp);
      const dto = validCreateDto({ word: 'duplika' });

      await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(dto)
        .expect(201);

      await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(dto)
        .expect(409);
    });

    it('allows same word with different part of speech', async () => {
      const auth = await registerContributor(setup.serverHttp);

      await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(
          validCreateDto({
            word: 'piga',
            partOfSpeech: PartOfSpeech.NOUN,
            senses: [{ definition: 'Pigo au mpigo.' }],
          }),
        )
        .expect(201);

      await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(
          validCreateDto({
            word: 'piga',
            partOfSpeech: PartOfSpeech.VERB,
            senses: [{ definition: 'Kupiga kitu kwa nguvu.' }],
          }),
        )
        .expect(201);
    });
  });

  describe('ownership and moderation', () => {
    it('soft-deletes own unverified entry', async () => {
      const auth = await registerContributor(setup.serverHttp);

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(validCreateDto({ word: 'futa' }))
        .expect(201);

      const deleted = await setup.serverHttp
        .delete(`/api/entries/${created.body.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .expect(200);

      expect(deleted.body).toEqual({ deleted: true, soft: true });

      const search = await setup.serverHttp
        .get('/api/entries/search')
        .query({ q: 'futa' })
        .expect(200);

      expect(search.body).toEqual([]);
    });

    it('forbids another contributor from deleting', async () => {
      const owner = await registerContributor(setup.serverHttp, 'owner');
      const other = await registerContributor(setup.serverHttp, 'other');

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(validCreateDto({ word: 'mali' }))
        .expect(201);

      await setup.serverHttp
        .delete(`/api/entries/${created.body.id}`)
        .set('Authorization', `Bearer ${other.token}`)
        .expect(403);
    });

    it('moderator verifies entry via moderate endpoint', async () => {
      const contributor = await registerContributor(setup.serverHttp, 'c1');
      const moderator = await registerModerator(setup, 'm1');

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${contributor.token}`)
        .send(validCreateDto({ word: 'thibitisha' }))
        .expect(201);

      expect(created.body.isVerified).toBe(false);

      const verified = await setup.serverHttp
        .post(`/api/entries/${created.body.id}/moderate`)
        .set('Authorization', `Bearer ${moderator.token}`)
        .send({ action: 'verify' })
        .expect(201);

      expect(verified.body.isVerified).toBe(true);
    });

    it('contributor cannot call moderate', async () => {
      const auth = await registerContributor(setup.serverHttp, 'c2');
      const lemma = await lemmaFactory.create({ word: 'mod' });

      await setup.serverHttp
        .post(`/api/entries/${lemma.id}/moderate`)
        .set('Authorization', `Bearer ${auth.token}`)
        .send({ action: 'verify' })
        .expect(403);
    });

    it('creator cannot delete verified entry; moderator can soft-delete', async () => {
      const contributor = await registerContributor(setup.serverHttp, 'c3');
      const moderator = await registerModerator(setup, 'm2');

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${contributor.token}`)
        .send(validCreateDto({ word: 'thibitishwa' }))
        .expect(201);

      await setup.serverHttp
        .post(`/api/entries/${created.body.id}/moderate`)
        .set('Authorization', `Bearer ${moderator.token}`)
        .send({ action: 'verify' })
        .expect(201);

      await setup.serverHttp
        .delete(`/api/entries/${created.body.id}`)
        .set('Authorization', `Bearer ${contributor.token}`)
        .expect(403);

      await setup.serverHttp
        .delete(`/api/entries/${created.body.id}`)
        .set('Authorization', `Bearer ${moderator.token}`)
        .expect(200);
    });
  });

  describe('update and versioning', () => {
    it('creator update bumps version and resets verification', async () => {
      const auth = await registerContributor(setup.serverHttp, 'u1');

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${auth.token}`)
        .send(validCreateDto({ word: 'sasisha' }))
        .expect(201);

      const updated = await setup.serverHttp
        .patch(`/api/entries/${created.body.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .send({
          senses: [{ definition: 'Maana iliyosasishwa kwa Kiswahili.' }],
        })
        .expect(200);

      expect(updated.body.version).toBe(2);
      expect(updated.body.isVerified).toBe(false);
      expect(updated.body.revisions?.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('votes', () => {
    it('casts and retracts a community vote', async () => {
      const owner = await registerContributor(setup.serverHttp, 'vote_owner');
      const voter = await registerContributor(setup.serverHttp, 'vote_voter');

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(validCreateDto({ word: 'kura' }))
        .expect(201);

      const voted = await setup.serverHttp
        .post(`/api/entries/${created.body.id}/vote`)
        .set('Authorization', `Bearer ${voter.token}`)
        .send({ vote: 1 })
        .expect(201);

      expect(voted.body.voteCount).toBe(1);

      await setup.serverHttp
        .delete(`/api/entries/${created.body.id}/vote`)
        .set('Authorization', `Bearer ${voter.token}`)
        .expect(200);
    });

    it('forbids self-vote and duplicate vote', async () => {
      const owner = await registerContributor(setup.serverHttp, 'self_owner');
      const voter = await registerContributor(setup.serverHttp, 'dup_voter');

      const created = await setup.serverHttp
        .post('/api/entries')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(validCreateDto({ word: 'binafsi' }))
        .expect(201);

      await setup.serverHttp
        .post(`/api/entries/${created.body.id}/vote`)
        .set('Authorization', `Bearer ${owner.token}`)
        .send({ vote: 1 })
        .expect(403);

      await setup.serverHttp
        .post(`/api/entries/${created.body.id}/vote`)
        .set('Authorization', `Bearer ${voter.token}`)
        .send({ vote: 1 })
        .expect(201);

      await setup.serverHttp
        .post(`/api/entries/${created.body.id}/vote`)
        .set('Authorization', `Bearer ${voter.token}`)
        .send({ vote: 1 })
        .expect(409);
    });
  });
});
