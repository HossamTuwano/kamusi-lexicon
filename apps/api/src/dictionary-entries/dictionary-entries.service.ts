import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CANONICAL_LANGUAGE, PartOfSpeechLabels, UserRole } from '@kamusi/core';
import {
  ContributionStatus,
  Example,
  Lemma,
  LemmaContribution,
  LemmaReport,
  LemmaRevision,
  Sense,
  User,
} from '@kamusi/database';
import {
  CreateEntryDto,
  ModerationAction,
  ReportDto,
  SearchDto,
  UpdateEntryDto,
} from './dto/entry.dto';
import {
  CreateContributionDto,
  ApproveContributionDto,
  RejectContributionDto,
} from './dto/contribution.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

function isModerator(role: UserRole): boolean {
  return role === 'moderator' || role === 'admin';
}

@Injectable()
export class DictionaryEntriesService {
  constructor(
    @InjectRepository(Lemma)
    private lemmaRepo: Repository<Lemma>,
    @InjectRepository(Sense)
    private senseRepo: Repository<Sense>,
    @InjectRepository(Example)
    private exampleRepo: Repository<Example>,
    @InjectRepository(LemmaContribution)
    private contributionRepo: Repository<LemmaContribution>,
    @InjectRepository(LemmaRevision)
    private revisionRepo: Repository<LemmaRevision>,
    @InjectRepository(LemmaReport)
    private reportRepo: Repository<LemmaReport>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private dataSource: DataSource,
  ) {}

  async search(dto: SearchDto) {
    const { q, page = 1, limit = 20 } = dto;
    const offset = (page - 1) * limit;

    const normQ = q?.trim().toLowerCase() || '';

    const cacheKey = `search:${normQ}:${page}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const query = this.lemmaRepo
      .createQueryBuilder('lemma')
      .leftJoinAndSelect('lemma.senses', 'sense')
      .leftJoinAndSelect('sense.examples', 'example');

    if (normQ) {
      query.andWhere('lemma.word % :q', { q: normQ });
      query
        .addSelect('similarity(lemma.word, :q)', 'search_rank')
        .orderBy('search_rank', 'DESC');
    }

    query.andWhere('lemma.is_hidden = false');
    query.andWhere('lemma.is_verified = true');
    query.andWhere('lemma.language = :lang', { lang: CANONICAL_LANGUAGE });
    query.skip(offset).take(limit);

    const results = await query.getMany();
    await this.cacheManager.set(cacheKey, results, 3600);

    return results;
  }

  /**
   * Moderator search includes hidden entries.
   * Public search intentionally hides them to keep Phase 1 UI safe.
   */
  async searchModeration(dto: SearchDto) {
    const { q, page = 1, limit = 20 } = dto;
    const offset = (page - 1) * limit;

    const normQ = q?.trim().toLowerCase() || '';

    const cacheKey = `moderation_search:${normQ}:${page}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const query = this.lemmaRepo
      .createQueryBuilder('lemma')
      .leftJoinAndSelect('lemma.senses', 'sense')
      .leftJoinAndSelect('sense.examples', 'example');

    if (normQ) {
      query.andWhere('lemma.word % :q', { q: normQ });
      query
        .addSelect('similarity(lemma.word, :q)', 'search_rank')
        .orderBy('search_rank', 'DESC');
    }

    // Unlike public search, do NOT force is_hidden=false.
    query.andWhere('lemma.language = :lang', { lang: CANONICAL_LANGUAGE });
    query.skip(offset).take(limit);

    const results = await query.getMany();
    await this.cacheManager.set(cacheKey, results, 3600);

    return results;
  }

  async create(dto: CreateEntryDto, userId: number) {
    this.assertSwahiliSenses(dto.senses);

    const existing = await this.lemmaRepo.findOne({
      where: {
        word: dto.word.trim().toLowerCase(),
        part_of_speech: dto.partOfSpeech,
      },
    });
    if (existing) {
      throw new ConflictException(
        `Neno "${dto.word}" tayari lipo kwa aina ya neno "${
          PartOfSpeechLabels[dto.partOfSpeech] ?? dto.partOfSpeech
        }"`,
      );
    }

    const lemma = this.lemmaRepo.create({
      word: dto.word.trim().toLowerCase(),
      part_of_speech: dto.partOfSpeech,
      pronunciation: dto.pronunciation ?? null,
      plural: dto.plural ?? null,
      synonyms: dto.synonyms ?? [],
      antonyms: dto.antonyms ?? [],
      derived_words: dto.derivedWords ?? [],
      dialect: dto.dialect ?? null,
      source: dto.source ?? null,
      creator_id: userId,
      language: CANONICAL_LANGUAGE,
      is_verified: false,
      vote_count: 0,
      version: 1,
    });

    const savedLemma = await this.lemmaRepo.save(lemma);
    savedLemma.senses = await this.persistSenses(savedLemma.id, dto.senses);
    await this.lemmaRepo.save(savedLemma);

    await this.recordContribution(savedLemma.id, userId, 'created');
    await this.recordRevision(savedLemma, userId);

    return this.findOne(savedLemma.id);
  }

  async update(
    id: number,
    dto: UpdateEntryDto,
    userId: number,
    role: UserRole,
  ) {
    const lemma = await this.findOne(id);
    if (!lemma) throw new NotFoundException();

    const isOwner = lemma.creator_id === userId;
    if (!isOwner && !isModerator(role)) {
      throw new ForbiddenException('Ni mmiliki tu au mhakiki ndiye anayeweza kubadilisha mchango huu');
    }

    if (dto.senses) {
      this.assertSwahiliSenses(dto.senses);
      await this.senseRepo.delete({ lemma_id: id });
      lemma.senses = await this.persistSenses(id, dto.senses);
    }

    if (dto.pronunciation !== undefined) lemma.pronunciation = dto.pronunciation;
    if (dto.plural !== undefined) lemma.plural = dto.plural;
    if (dto.synonyms !== undefined) lemma.synonyms = dto.synonyms;
    if (dto.antonyms !== undefined) lemma.antonyms = dto.antonyms;
    if (dto.derivedWords !== undefined) lemma.derived_words = dto.derivedWords;
    if (dto.dialect !== undefined) lemma.dialect = dto.dialect;
    if (dto.source !== undefined) lemma.source = dto.source;

    lemma.language = CANONICAL_LANGUAGE;
    lemma.version = (lemma.version || 1) + 1;
    lemma.is_verified = false;

    await this.lemmaRepo.save(lemma);
    await this.recordContribution(id, userId, 'updated');
    await this.recordRevision(lemma, userId);

    return this.findOne(id);
  }

  async findOne(id: number) {
    return this.lemmaRepo.findOne({
      where: { id },
      relations: ['senses', 'senses.examples', 'contributions', 'revisions'],
    });
  }

  async delete(id: number, userId: number, role: UserRole) {
    const lemma = await this.findOne(id);
    if (!lemma) throw new NotFoundException();

    const isOwner = lemma.creator_id === userId;
    if (!isOwner && !isModerator(role)) {
      throw new ForbiddenException('Ni mmiliki tu au mhakiki ndiye anayeweza kufuta mchango huu');
    }

    if (lemma.is_verified && !isModerator(role)) {
      throw new ForbiddenException('Huwezi kufuta maneno yaliyothibitishwa');
    }

    // Soft-delete preserves contributor history and revisions.
    lemma.is_hidden = true;
    await this.lemmaRepo.save(lemma);
    await this.recordContribution(id, userId, 'deleted');
    return { deleted: true, soft: true };
  }

  async moderate(
    id: number,
    action: 'verify' | 'hide' | 'restore',
    userId: number,
    role: UserRole,
  ) {
    if (!isModerator(role)) {
      throw new ForbiddenException('Unahitaji kuwa mhakiki');
    }

    const lemma = await this.lemmaRepo.findOne({ where: { id } });
    if (!lemma) throw new NotFoundException();

    return this.applyModeration(lemma, action, userId);
  }

  async bulkModerate(
    ids: number[],
    action: ModerationAction,
    userId: number,
    role: UserRole,
  ) {
    if (!isModerator(role)) {
      throw new ForbiddenException('Unahitaji kuwa mhakiki');
    }

    if (!ids?.length) {
      throw new BadRequestException('Angalau kitambulisho cha neno moja kinahitajika');
    }

    const results: Array<{
      id: number;
      status: 'ok' | 'not_found' | 'error';
      error?: string;
    }> = [];

    for (const id of ids) {
      const lemma = await this.lemmaRepo.findOne({ where: { id } });
      if (!lemma) {
        results.push({ id, status: 'not_found' });
        continue;
      }
      try {
        await this.applyModeration(lemma, action, userId);
        results.push({ id, status: 'ok' });
      } catch (err) {
        results.push({
          id,
          status: 'error',
          error: err instanceof Error ? err.message : 'unknown error',
        });
      }
    }

    const applied = results.filter((r) => r.status === 'ok').length;
    return { action, total: ids.length, applied, results };
  }

  /**
   * Flag an entry as problematic. Any authenticated contributor may report,
   * except the entry's own creator. One open report per user per entry.
   */
  async report(
    id: number,
    userId: number,
    dto: ReportDto,
  ): Promise<LemmaReport> {
    const lemma = await this.lemmaRepo.findOne({ where: { id } });
    if (!lemma) throw new NotFoundException();

    if (lemma.creator_id === userId) {
      throw new ForbiddenException('Huwezi kuripoti mchango wako mwenyewe');
    }

    const existing = await this.reportRepo.findOne({
      where: { lemma_id: id, user_id: userId },
    });
    if (existing) {
      throw new ConflictException('Tayari umeripoti mchango huu');
    }

    const report = this.reportRepo.create({
      lemma_id: id,
      user_id: userId,
      reason: dto.reason,
      note: dto.note?.trim() || null,
      status: 'open',
    });
    const saved = await this.reportRepo.save(report);

    await this.lemmaRepo.increment({ id }, 'report_count', 1);
    await this.recordContribution(id, userId, 'reported', dto.reason);
    await this.cacheManager.clear();
    return saved;
  }

  /** Moderator view: all reports for an entry (open first, newest first). */
  async findReports(id: number): Promise<LemmaReport[]> {
    const lemma = await this.lemmaRepo.findOne({ where: { id } });
    if (!lemma) throw new NotFoundException();

    return this.reportRepo.find({
      where: { lemma_id: id },
      order: { status: 'ASC', created_at: 'DESC' },
    });
  }

  private async resolveReportsFor(lemmaId: number): Promise<void> {
    await this.reportRepo.update(
      { lemma_id: lemmaId, status: 'open' },
      { status: 'resolved' },
    );
    await this.lemmaRepo.update({ id: lemmaId }, { report_count: 0 });
  }

  private async applyModeration(
    lemma: Lemma,
    action: ModerationAction,
    userId: number,
  ): Promise<Lemma> {
    if (action === 'verify') {
      lemma.is_verified = true;
      lemma.is_hidden = false;
      await this.lemmaRepo.save(lemma);
      await this.recordContribution(lemma.id, userId, 'verified');
    } else if (action === 'hide') {
      lemma.is_hidden = true;
      await this.lemmaRepo.save(lemma);
      await this.recordContribution(lemma.id, userId, 'hidden');
    } else if (action === 'restore') {
      lemma.is_hidden = false;
      await this.lemmaRepo.save(lemma);
      await this.recordContribution(lemma.id, userId, 'restored');
    } else {
      throw new BadRequestException('Hatua ya uhakiki haijulikani');
    }

    // A moderator decision on the entry resolves any open reports.
    await this.resolveReportsFor(lemma.id);
    lemma.report_count = 0;
    await this.cacheManager.clear();

    return lemma;
  }

  private assertSwahiliSenses(
    senses: Array<{ definition: string; examples?: Array<{ sentence: string }> }>,
  ) {
    if (!senses?.length) {
      throw new BadRequestException('Angalau maana moja ya Kiswahili inahitajika');
    }
    for (const sense of senses) {
      if (!sense.definition?.trim()) {
        throw new BadRequestException('Kila maana lazima iwe na ufafanuzi usio tupu wa Kiswahili');
      }
      // Reject obvious English-only glosses that are a single Latin word with no Swahili context.
      // This is a soft guard, not a full language detector.
      const def = sense.definition.trim();
      if (/^[A-Za-z]+$/.test(def) && def.length < 4) {
        throw new BadRequestException(
          'Ufafanuzi unaonekana haujakamilika. Toa ufafanuzi kamili wa Kiswahili (mfano: "Chombo cha usafiri...").',
        );
      }
    }
  }

  private async persistSenses(
    lemmaId: number,
    sensesDto: CreateEntryDto['senses'],
  ): Promise<Sense[]> {
    const senses: Sense[] = [];
    for (const sDto of sensesDto) {
      const sense = this.senseRepo.create({
        definition: sDto.definition.trim(),
        usage_note: sDto.usageNote?.trim() || null,
        lemma_id: lemmaId,
      });
      const savedSense = await this.senseRepo.save(sense);

      if (sDto.examples?.length) {
        const examples = sDto.examples.map((eDto) =>
          this.exampleRepo.create({
            sentence: eDto.sentence.trim(),
            note: eDto.note?.trim() || null,
            sense_id: savedSense.id,
          }),
        );
        savedSense.examples = await this.exampleRepo.save(examples);
      } else {
        savedSense.examples = [];
      }
      senses.push(savedSense);
    }
    return senses;
  }

  private async recordContribution(
    lemmaId: number,
    userId: number,
    action: LemmaContribution['action'],
    note?: string,
  ) {
    await this.contributionRepo.save(
      this.contributionRepo.create({
        lemma_id: lemmaId,
        user_id: userId,
        action,
        note: note ?? null,
      }),
    );
  }

  /** Moderator view: proposal queue, newest first. Filter by status (default: pending). */
  async findContributions(status?: string) {
    const qb = this.contributionRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.lemma', 'lemma')
      .leftJoin(User, 'user', 'user.id = c.user_id')
      .addSelect(['user.id', 'user.username'])
      .where('c.action IN (:...proposalActions)', {
        proposalActions: ['add_sense', 'add_example', 'correct_info'],
      })
      .orderBy('c.created_at', 'DESC');

    if (status) {
      qb.andWhere('c.status = :status', { status });
    }

    const { entities, raw } = await qb.getRawAndEntities();
    return entities.map((c, i) => ({
      id: c.id,
      action: c.action,
      status: c.status,
      note: c.note,
      proposedContent: c.proposed_content,
      createdAt: c.created_at,
      lemma: c.lemma
        ? {
            id: c.lemma.id,
            word: c.lemma.word,
            partOfSpeech: c.lemma.part_of_speech,
          }
        : null,
      userId: c.user_id,
      username: raw[i]?.user_username ?? null,
    }));
  }

  async submitContribution(dto: CreateContributionDto, userId: number) {
    const lemma = await this.lemmaRepo.findOne({ where: { id: dto.lemmaId } });
    if (!lemma) throw new NotFoundException('Neno halipatikani');

    const contribution = this.contributionRepo.create({
      lemma_id: dto.lemmaId,
      user_id: userId,
      action: dto.action,
      proposed_content: {
        senses: dto.proposedSenses,
        examples: dto.proposedExamples,
        text: dto.proposedText,
      },
      note: dto.note ?? null,
      status: ContributionStatus.PENDING,
    });

    return this.contributionRepo.save(contribution);
  }

  async approveContribution(dto: ApproveContributionDto, userId: number, role: UserRole) {
    if (!isModerator(role)) throw new ForbiddenException('Unahitaji kuwa mhakiki');

    const contribution = await this.contributionRepo.findOne({
      where: { id: dto.contributionId },
      relations: ['lemma'],
    });
    if (!contribution) throw new NotFoundException('Mchango haukupatikana');
    if (contribution.status !== ContributionStatus.PENDING) {
      throw new BadRequestException('Mchango umeshashughulikiwa');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const content = contribution.proposed_content;

      if (contribution.action === 'add_sense' && content.senses) {
        for (const sDto of content.senses) {
          const sense = queryRunner.manager.create(Sense, {
            definition: sDto.definition,
            usage_note: sDto.usageNote,
            lemma_id: contribution.lemma_id,
          });
          const savedSense = await queryRunner.manager.save(sense);
          if (sDto.examples) {
            const examples = sDto.examples.map(eDto => 
              queryRunner.manager.create(Example, {
                sentence: eDto.sentence,
                note: eDto.note,
                sense_id: savedSense.id,
              })
            );
            await queryRunner.manager.save(examples);
          }
        }
      } else if (contribution.action === 'add_example' && content.examples) {
        // Since we don't know WHICH sense to add to in a simple proposal, 
        // we usually link to the first sense or require a senseId in the proposal.
        // For Phase 1, we'll link to the most recent sense.
        const latestSense = await queryRunner.manager.findOne(Sense, {
          where: { lemma_id: contribution.lemma_id },
          order: { id: 'DESC' },
        });
        if (!latestSense) throw new BadRequestException('Hakuna maana ya kuunganisha mfano nayo');
        
        const examples = content.examples.map(eDto => 
          queryRunner.manager.create(Example, {
            sentence: eDto.sentence,
            note: eDto.note,
            sense_id: latestSense.id,
          })
        );
        await queryRunner.manager.save(examples);
      }

      contribution.status = ContributionStatus.APPROVED;
      await queryRunner.manager.save(contribution);
      
      await queryRunner.commitTransaction();
      await this.cacheManager.clear();
      return { success: true };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async rejectContribution(dto: RejectContributionDto, userId: number, role: UserRole) {
    if (!isModerator(role)) throw new ForbiddenException('Unahitaji kuwa mhakiki');

    const contribution = await this.contributionRepo.findOne({ where: { id: dto.contributionId } });
    if (!contribution) throw new NotFoundException('Mchango haukupatikana');

    contribution.status = ContributionStatus.REJECTED;
    contribution.note = `Rejected: ${dto.reason}`;
    await this.contributionRepo.save(contribution);

    return { success: true };
  }


  private async recordRevision(lemma: Lemma, userId: number) {
    // Snapshot matches @kamusi/core Lemma shape (camelCase).
    const snapshot = {
      word: lemma.word,
      language: lemma.language,
      partOfSpeech: lemma.part_of_speech,
      pronunciation: lemma.pronunciation,
      plural: lemma.plural,
      synonyms: lemma.synonyms,
      antonyms: lemma.antonyms,
      derivedWords: lemma.derived_words,
      dialect: lemma.dialect,
      source: lemma.source,
      version: lemma.version,
      isVerified: lemma.is_verified,
      senses: (lemma.senses || []).map((s) => ({
        definition: s.definition,
        usageNote: s.usage_note,
        examples: (s.examples || []).map((e) => ({
          sentence: e.sentence,
          note: e.note,
        })),
      })),
    };

    await this.revisionRepo.save(
      this.revisionRepo.create({
        lemma_id: lemma.id,
        version: lemma.version,
        snapshot,
        changed_by: userId,
      }),
    );
  }
}
