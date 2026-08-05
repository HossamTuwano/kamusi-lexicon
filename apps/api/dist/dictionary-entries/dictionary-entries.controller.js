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
exports.DictionaryEntriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const dictionary_entries_service_1 = require("./dictionary-entries.service");
const entry_dto_1 = require("./dto/entry.dto");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
let DictionaryEntriesController = class DictionaryEntriesController {
    constructor(entriesService) {
        this.entriesService = entriesService;
    }
    async search(dto) {
        return this.entriesService.search(dto);
    }
    async findOne(id) {
        return this.entriesService.findOne(+id);
    }
    async create(dto, req) {
        return this.entriesService.create(dto, req.user.userId);
    }
    async remove(id, req) {
        return this.entriesService.delete(+id, req.user.userId);
    }
};
exports.DictionaryEntriesController = DictionaryEntriesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bidirectional fuzzy search' }),
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entry_dto_1.SearchDto]),
    __metadata("design:returntype", Promise)
], DictionaryEntriesController.prototype, "search", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Fetch single entry' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DictionaryEntriesController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Submit new entry' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [entry_dto_1.CreateEntryDto, Object]),
    __metadata("design:returntype", Promise)
], DictionaryEntriesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Remove own unverified entry' }),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DictionaryEntriesController.prototype, "remove", null);
exports.DictionaryEntriesController = DictionaryEntriesController = __decorate([
    (0, swagger_1.ApiTags)('Dictionary'),
    (0, common_1.Controller)('entries'),
    __metadata("design:paramtypes", [dictionary_entries_service_1.DictionaryEntriesService])
], DictionaryEntriesController);
