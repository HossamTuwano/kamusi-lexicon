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
exports.VotesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const vote_entity_1 = require("./entities/vote.entity");
const lemma_entity_1 = require("../dictionary-entries/entities/lemma.entity");
const users_service_1 = require("../users/users.service");
const common_2 = require("@nestjs/common");
let VotesService = class VotesService {
    constructor(dataSource, voteRepo, lemmaRepo, usersService) {
        this.dataSource = dataSource;
        this.voteRepo = voteRepo;
        this.lemmaRepo = lemmaRepo;
        this.usersService = usersService;
    }
    async vote(entryId, userId, voteType) {
        if (voteType !== 1 && voteType !== -1)
            throw new common_1.BadRequestException('Vote must be 1 or -1');
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const lemma = await queryRunner.manager.findOne(lemma_entity_1.Lemma, { where: { id: entryId } });
            if (!lemma)
                throw new common_1.NotFoundException();
            if (lemma.creator_id === userId) {
                throw new common_2.ForbiddenException('You cannot vote for your own entry');
            }
            await queryRunner.manager.insert(vote_entity_1.VerificationVote, {
                entry_id: entryId,
                user_id: userId,
                vote_type: voteType,
            });
            const updateResult = await queryRunner.manager
                .createQueryBuilder()
                .update(lemma_entity_1.Lemma)
                .set({ vote_count: () => `vote_count + ${voteType}` })
                .where('id = :id', { id: entryId })
                .returning(['vote_count', 'is_verified'])
                .execute();
            const updatedLemma = updateResult.raw[0];
            const newVoteCount = updatedLemma.vote_count;
            if (newVoteCount >= 5 && !updatedLemma.is_verified) {
                await queryRunner.manager.update(lemma_entity_1.Lemma, entryId, { is_verified: true });
                await this.usersService.updateReputation(lemma.creator_id, 10);
            }
            else if (newVoteCount <= -3) {
                await queryRunner.manager.update(lemma_entity_1.Lemma, entryId, { is_hidden: true });
            }
            await queryRunner.commitTransaction();
            return { vote_count: newVoteCount, is_verified: updatedLemma.is_verified };
        }
        catch (e) {
            await queryRunner.rollbackTransaction();
            if (e.code === '23505')
                throw new common_2.ConflictException('You have already voted on this entry');
            throw e;
        }
        finally {
            await queryRunner.release();
        }
    }
    async removeVote(entryId, userId) {
        const result = await this.voteRepo.delete({ entry_id: entryId, user_id: userId });
        if (result.affected === 0)
            throw new common_1.NotFoundException('Vote not found');
    }
};
exports.VotesService = VotesService;
exports.VotesService = VotesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(vote_entity_1.VerificationVote)),
    __param(2, (0, typeorm_1.InjectRepository)(lemma_entity_1.Lemma)),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        typeorm_2.Repository,
        typeorm_2.Repository,
        users_service_1.UsersService])
], VotesService);
