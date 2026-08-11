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
const sense_entity_1 = require("./sense.entity");
var PartOfSpeech;
(function (PartOfSpeech) {
    PartOfSpeech["NOUN"] = "noun";
    PartOfSpeech["VERB"] = "verb";
    PartOfSpeech["ADJECTIVE"] = "adjective";
    PartOfSpeech["ADVERB"] = "adverb";
    PartOfSpeech["PRONOUN"] = "pronoun";
    PartOfSpeech["PREPOSITION"] = "preposition";
    PartOfSpeech["CONJUNCTION"] = "conjunction";
    PartOfSpeech["INTERJECTION"] = "interjection";
    PartOfSpeech["IDIOM"] = "idiom";
    PartOfSpeech["PHRASE"] = "phrase";
})(PartOfSpeech || (exports.PartOfSpeech = PartOfSpeech = {}));
let Lemma = class Lemma {
};
exports.Lemma = Lemma;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Lemma.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)({ unique: true }),
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Lemma.prototype, "word", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'sw' }),
    __metadata("design:type", String)
], Lemma.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PartOfSpeech,
        default: PartOfSpeech.NOUN,
    }),
    __metadata("design:type", String)
], Lemma.prototype, "part_of_speech", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lemma.prototype, "pronunciation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], Lemma.prototype, "plural", void 0);
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
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Lemma.prototype, "creator_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Lemma.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sense_entity_1.Sense, (sense) => sense.lemma, { cascade: true }),
    __metadata("design:type", Array)
], Lemma.prototype, "senses", void 0);
exports.Lemma = Lemma = __decorate([
    (0, typeorm_1.Entity)('lemmas')
], Lemma);
