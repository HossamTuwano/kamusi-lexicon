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
exports.Lemma = exports.PartOfSpeech = void 0;
const typeorm_1 = require("typeorm");
const core_1 = require("@kamusi/core");
Object.defineProperty(exports, "PartOfSpeech", { enumerable: true, get: function () { return core_1.PartOfSpeech; } });
const sense_entity_1 = require("./sense.entity");
const lemma_contribution_entity_1 = require("./lemma-contribution.entity");
const lemma_revision_entity_1 = require("./lemma-revision.entity");
let Lemma = class Lemma {
};
exports.Lemma = Lemma;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Lemma.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Lemma.prototype, "word", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', default: core_1.CANONICAL_LANGUAGE }),
    __metadata("design:type", String)
], Lemma.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: core_1.PartOfSpeech,
        enumName: 'lemmas_part_of_speech_enum',
        default: core_1.PartOfSpeech.NOUN,
    }),
    __metadata("design:type", String)
], Lemma.prototype, "part_of_speech", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Lemma.prototype, "pronunciation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Lemma.prototype, "plural", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Lemma.prototype, "synonyms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Lemma.prototype, "antonyms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', array: true, default: '{}' }),
    __metadata("design:type", Array)
], Lemma.prototype, "derived_words", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Lemma.prototype, "dialect", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Lemma.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Lemma.prototype, "is_verified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Lemma.prototype, "vote_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Lemma.prototype, "is_hidden", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Object)
], Lemma.prototype, "creator_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", Number)
], Lemma.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Lemma.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sense_entity_1.Sense, (sense) => sense.lemma, { cascade: true }),
    __metadata("design:type", Array)
], Lemma.prototype, "senses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lemma_contribution_entity_1.LemmaContribution, (c) => c.lemma),
    __metadata("design:type", Array)
], Lemma.prototype, "contributions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => lemma_revision_entity_1.LemmaRevision, (r) => r.lemma),
    __metadata("design:type", Array)
], Lemma.prototype, "revisions", void 0);
exports.Lemma = Lemma = __decorate([
    (0, typeorm_1.Entity)('lemmas'),
    (0, typeorm_1.Index)(['word', 'part_of_speech'], { unique: true })
], Lemma);
