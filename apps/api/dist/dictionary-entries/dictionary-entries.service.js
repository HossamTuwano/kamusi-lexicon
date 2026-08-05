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
const dictionary_entry_entity_1 = require("./entities/dictionary-entry.entity");
const cache_manager_1 = require("@nestjs/cache-manager");
const common_2 = require("@nestjs/common");
let DictionaryEntriesService = class DictionaryEntriesService {
    constructor(entryRepo, cacheManager) {
        this.entryRepo = entryRepo;
        this.cacheManager = cacheManager;
    }
    async search(dto) {
        const { q, source, target, page = 1, limit = 20 } = dto;
        const offset = (page - 1) * limit;
        const normQ = q?.trim().toLowerCase() || '';
        const normS = source?.trim().toLowerCase() || '';
        const normT = target?.trim().toLowerCase() || '';
        const cacheKey = `search:${normS}:${normT}:${normQ}:${page}`;
        const cached = await this.cacheManager.get(cacheKey);
        if (cached)
            return cached;
        const query = this.entryRepo.createQueryBuilder('entry');
        if (normS)
            query.andWhere('lower(entry.source_language) = :normS', { normS });
        if (normT)
            query.andWhere('lower(entry.target_language) = :normT', { normT });
        if (normQ) {
            query.andWhere('(entry.source_word % :q OR entry.target_word % :q)', { q: normQ });
            query.orderBy(`similarity(entry.source_word, :q) + similarity(entry.target_word, :q)`, 'DESC');
        }
        query.andWhere('entry.is_hidden = false');
        query.skip(offset).take(limit);
        const results = await query.getMany();
        await this.cacheManager.set(cacheKey, results, 3600);
        return results;
    }
    async create(dto, userId) {
        try {
            const entry = this.entryRepo.create({
                ...dto,
                creatorId: userId,
                is_verified: false,
                vote_count: 0,
            });
            return await this.entryRepo.save(entry);
        }
        catch (e) {
            if (e.code === '23505') {
                throw new common_1.ConflictException('This translation already exists');
            }
            throw e;
        }
    }
    async findOne(id) {
        return this.entryRepo.findOne({ where: { id } });
    }
    async delete(id, userId) {
        const entry = await this.findOne(id);
        if (!entry)
            throw new common_1.NotFoundException();
        if (entry.creatorId !== userId || entry.is_verified) {
            throw new common_1.ForbiddenException('You can only delete your own unverified entries');
        }
        await this.entryRepo.remove(entry);
        return { deleted: true };
    }
};
exports.DictionaryEntriesService = DictionaryEntriesService;
exports.DictionaryEntriesService = DictionaryEntriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(dictionary_entry_entity_1.DictionaryEntry)),
    __param(1, (0, common_2.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], DictionaryEntriesService);
