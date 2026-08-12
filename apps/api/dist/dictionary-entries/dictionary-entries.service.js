"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryEntriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const core_1 = require("@kamusi/core");
const database_1 = require("@kamusi/database");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
function isModerator(role) {
    return role === 'moderator' || role === 'admin';
}
let DictionaryEntriesService = class DictionaryEntriesService {
    constructor(lemmaRepo, senseRepo, exampleRepo, contributionRepo, revisionRepo, cacheManager) {
        this.lemmaRepo = lemmaRepo;
        this.senseRepo = senseRepo;
        this.exampleRepo = exampleRepo;
        this.contributionRepo = contributionRepo;
        this.revisionRepo = revisionRepo;
        this.cacheManager = cacheManager;
    }
    async search(dto) {
        const { q, page = 1, limit = 20 } = dto;
        const offset = (page - 1) * limit;
        const normQ = q?.trim().toLowerCase() || '';
        const cacheKey = `search:${normQ}:${page}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
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
        query.andWhere('lemma.language = :lang', { lang: core_1.CANONICAL_LANGUAGE });
        query.skip(offset).take(limit);
        const results = await query.getMany();
        await this.cacheManager.set(cacheKey, results, 3600);
        return results;
    }
    /**
     * Moderator search includes hidden entries.
     * Public search intentionally hides them to keep Phase 1 UI safe.
     */
    async searchModeration(dto) {
        const { q, page = 1, limit = 20 } = dto;
        const offset = (page - 1) * limit;
        const normQ = q?.trim().toLowerCase() || '';
        const cacheKey = `moderation_search:${normQ}:${page}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
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
        query.andWhere('lemma.language = :lang', { lang: core_1.CANONICAL_LANGUAGE });
        query.skip(offset).take(limit);
        const results = await query.getMany();
        await this.cacheManager.set(cacheKey, results, 3600);
        return results;
    }
    async create(dto, userId) {
        this.assertSwahiliSenses(dto.senses);
        const existing = await this.lemmaRepo.findOne({
            where: {
                word: dto.word.trim().toLowerCase(),
                part_of_speech: dto.partOfSpeech,
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Lemma "${dto.word}" already exists for part of speech "${dto.partOfSpeech}"`);
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
            language: core_1.CANONICAL_LANGUAGE,
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
    async update(id, dto, userId, role) {
        const lemma = await this.findOne(id);
        if (!lemma)
            throw new common_1.NotFoundException();
        const isOwner = lemma.creator_id === userId;
        if (!isOwner && !isModerator(role)) {
            throw new common_1.ForbiddenException('Only the creator or a moderator can update this entry');
        }
        if (dto.senses) {
            this.assertSwahiliSenses(dto.senses);
            await this.senseRepo.delete({ lemma_id: id });
            lemma.senses = await this.persistSenses(id, dto.senses);
        }
        if (dto.pronunciation !== undefined)
            lemma.pronunciation = dto.pronunciation;
        if (dto.plural !== undefined)
            lemma.plural = dto.plural;
        if (dto.synonyms !== undefined)
            lemma.synonyms = dto.synonyms;
        if (dto.antonyms !== undefined)
            lemma.antonyms = dto.antonyms;
        if (dto.derivedWords !== undefined)
            lemma.derived_words = dto.derivedWords;
        if (dto.dialect !== undefined)
            lemma.dialect = dto.dialect;
        if (dto.source !== undefined)
            lemma.source = dto.source;
        lemma.language = core_1.CANONICAL_LANGUAGE;
        lemma.version = (lemma.version || 1) + 1;
        lemma.is_verified = false;
        await this.lemmaRepo.save(lemma);
        await this.recordContribution(id, userId, 'updated');
        await this.recordRevision(lemma, userId);
        return this.findOne(id);
    }
    async findOne(id) {
        return this.lemmaRepo.findOne({
            where: { id },
            relations: ['senses', 'senses.examples', 'contributions', 'revisions'],
        });
    }
    async delete(id, userId, role) {
        const lemma = await this.findOne(id);
        if (!lemma)
            throw new common_1.NotFoundException();
        const isOwner = lemma.creator_id === userId;
        if (!isOwner && !isModerator(role)) {
            throw new common_1.ForbiddenException('Only the creator or a moderator can delete this entry');
        }
        if (lemma.is_verified && !isModerator(role)) {
            throw new common_1.ForbiddenException('You cannot delete verified entries');
        }
        // Soft-delete preserves contributor history and revisions.
        lemma.is_hidden = true;
        await this.lemmaRepo.save(lemma);
        await this.recordContribution(id, userId, 'deleted');
        return { deleted: true, soft: true };
    }
    async moderate(id, action, userId, role) {
        if (!isModerator(role)) {
            throw new common_1.ForbiddenException('Moderator role required');
        }
        const lemma = await this.lemmaRepo.findOne({ where: { id } });
        if (!lemma)
            throw new common_1.NotFoundException();
        if (action === 'verify') {
            lemma.is_verified = true;
            lemma.is_hidden = false;
            await this.lemmaRepo.save(lemma);
            await this.recordContribution(id, userId, 'verified');
        }
        else if (action === 'hide') {
            lemma.is_hidden = true;
            await this.lemmaRepo.save(lemma);
            await this.recordContribution(id, userId, 'hidden');
        }
        else if (action === 'restore') {
            lemma.is_hidden = false;
            await this.lemmaRepo.save(lemma);
            await this.recordContribution(id, userId, 'restored');
        }
        else {
            throw new common_1.BadRequestException('Unknown moderation action');
        }
        return lemma;
    }
    assertSwahiliSenses(senses) {
        if (!senses?.length) {
            throw new common_1.BadRequestException('At least one Swahili sense is required');
        }
        for (const sense of senses) {
            if (!sense.definition?.trim()) {
                throw new common_1.BadRequestException('Each sense must have a non-empty Swahili definition');
            }
            // Reject obvious English-only glosses that are a single Latin word with no Swahili context.
            // This is a soft guard, not a full language detector.
            const def = sense.definition.trim();
            if (/^[A-Za-z]+$/.test(def) && def.length < 4) {
                throw new common_1.BadRequestException('Definition looks incomplete. Provide a full Swahili definition (e.g. "Chombo cha usafiri...").');
            }
        }
    }
    async persistSenses(lemmaId, sensesDto) {
        const senses = [];
        for (const sDto of sensesDto) {
            const sense = this.senseRepo.create({
                definition: sDto.definition.trim(),
                usage_note: sDto.usageNote?.trim() || null,
                lemma_id: lemmaId,
            });
            const savedSense = await this.senseRepo.save(sense);
            if (sDto.examples?.length) {
                const examples = sDto.examples.map((eDto) => this.exampleRepo.create({
                    sentence: eDto.sentence.trim(),
                    note: eDto.note?.trim() || null,
                    sense_id: savedSense.id,
                }));
                savedSense.examples = await this.exampleRepo.save(examples);
            }
            else {
                savedSense.examples = [];
            }
            senses.push(savedSense);
        }
        return senses;
    }
    async recordContribution(lemmaId, userId, action, note) {
        await this.contributionRepo.save(this.contributionRepo.create({
            lemma_id: lemmaId,
            user_id: userId,
            action,
            note: note ?? null,
        }));
    }
    async recordRevision(lemma, userId) {
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
        await this.revisionRepo.save(this.revisionRepo.create({
            lemma_id: lemma.id,
            version: lemma.version,
            snapshot,
            changed_by: userId,
        }));
    }
};
exports.DictionaryEntriesService = DictionaryEntriesService;
exports.DictionaryEntriesService = DictionaryEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.Lemma)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.Sense)),
    __param(2, (0, typeorm_1.InjectRepository)(database_1.Example)),
    __param(3, (0, typeorm_1.InjectRepository)(database_1.LemmaContribution)),
    __param(4, (0, typeorm_1.InjectRepository)(database_1.LemmaRevision)),
    __param(5, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository, Object])
], DictionaryEntriesService);
