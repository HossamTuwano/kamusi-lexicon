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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryEntry = exports.EntryType = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
var EntryType;
(function (EntryType) {
    EntryType["NOUN"] = "noun";
    EntryType["VERB"] = "verb";
    EntryType["ADJECTIVE"] = "adjective";
    EntryType["ADVERB"] = "adverb";
    EntryType["IDIOM"] = "idiom";
    EntryType["PHRASE"] = "phrase";
})(EntryType || (exports.EntryType = EntryType = {}));
let DictionaryEntry = class DictionaryEntry {
};
exports.DictionaryEntry = DictionaryEntry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], DictionaryEntry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DictionaryEntry.prototype, "source_language", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], DictionaryEntry.prototype, "target_language", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], DictionaryEntry.prototype, "source_word", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], DictionaryEntry.prototype, "target_word", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: EntryType,
        default: EntryType.NOUN,
    }),
    __metadata("design:type", String)
], DictionaryEntry.prototype, "word_type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DictionaryEntry.prototype, "context_note", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'creator_id' }),
    __metadata("design:type", user_entity_1.User)
], DictionaryEntry.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creator_id', nullable: true }),
    __metadata("design:type", Number)
], DictionaryEntry.prototype, "creatorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DictionaryEntry.prototype, "is_verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], DictionaryEntry.prototype, "vote_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], DictionaryEntry.prototype, "is_hidden", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], DictionaryEntry.prototype, "created_at", void 0);
exports.DictionaryEntry = DictionaryEntry = __decorate([
    (0, typeorm_1.Entity)('dictionary_entries'),
    (0, typeorm_1.Index)(['source_language', 'target_language', 'source_word', 'target_word'], { unique: true })
], DictionaryEntry);
