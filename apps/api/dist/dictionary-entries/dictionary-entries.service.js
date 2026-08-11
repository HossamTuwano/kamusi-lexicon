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
const lemma_entity_1 = require("./entities/lemma.entity");
const sense_entity_1 = require("./entities/sense.entity");
const example_entity_1 = require("./entities/example.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let DictionaryEntriesService = class DictionaryEntriesService {
    constructor(lemmaRepo, cacheManager) {
        this.lemmaRepo = lemmaRepo;
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
        const query = this.lemmaRepo.createQueryBuilder('lemma')
            .leftJoinAndSelect('lemma.senses', 'sense')
            .leftJoinAndSelect('sense.examples', 'example');
        if (normQ) {
            query.andWhere('lemma.word % :q', { q: normQ });
            query.orderBy(`similarity(lemma.word, :q)`, 'DESC');
        }
        query.andWhere('lemma.is_hidden = false');
        query.skip(offset).take(limit);
        const results = await query.getMany();
        await this.cacheManager.set(cacheKey, results, 3600);
        return results;
    }
    async create(dto, userId) {
        const lemma = this.lemmaRepo.create({
            ...dto,
            creator_id: userId,
            language: 'sw',
            is_verified: false,
            vote_count: 0,
        });
        const savedLemma = await this.lemmaRepo.save(lemma);
        // Create Senses and Examples
        if (dto.senses && dto.senses.length > 0) {
            const senses = dto.senses.map(sDto => {
                const sense = new sense_entity_1.Sense();
                sense.definition = sDto.definition;
                sense.usage_note = sDto.usage_note;
                sense.lemma_id = savedLemma.id;
                if (sDto.examples) {
                    sense.examples = sDto.examples.map(eDto => {
                        const example = new example_entity_1.Example();
                        example.sentence = eDto.sentence;
                        example.note = eDto.note;
                        return example;
                    });
                }
                return sense;
            });
            // This requires a Sense repository or using the Lemma's cascade
            // Since we set cascade: true on Lemma.senses, we can just attach them.
            savedLemma.senses = senses;
            await this.lemmaRepo.save(savedLemma);
        }
        return savedLemma;
    }
    async findOne(id) {
        return this.lemmaRepo.findOne({
            where: { id },
            relations: ['senses', 'senses.examples']
        });
    }
    async delete(id, userId) {
        const lemma = await this.findOne(id);
        if (!lemma)
            throw new common_1.NotFoundException();
        // Note: creatorId needs to be added to Lemma entity for this to work
        if (lemma.is_verified) {
            throw new common_1.ForbiddenException('You cannot delete verified entries');
        }
        await this.lemmaRepo.remove(lemma);
        return { deleted: true };
    }
};
exports.DictionaryEntriesService = DictionaryEntriesService;
exports.DictionaryEntriesService = DictionaryEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(lemma_entity_1.Lemma)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], DictionaryEntriesService);
