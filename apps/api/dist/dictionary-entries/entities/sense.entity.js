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
exports.Sense = void 0;
const typeorm_1 = require("typeorm");
const lemma_entity_1 = require("./lemma.entity");
const example_entity_1 = require("./example.entity");
let Sense = class Sense {
};
exports.Sense = Sense;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sense.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Sense.prototype, "definition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Sense.prototype, "usage_note", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lemma_entity_1.Lemma, (lemma) => lemma.senses, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'lemma_id' }),
    __metadata("design:type", lemma_entity_1.Lemma)
], Sense.prototype, "lemma", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Sense.prototype, "lemma_id", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => example_entity_1.Example, (example) => example.sense, { cascade: true }),
    __metadata("design:type", Array)
], Sense.prototype, "examples", void 0);
exports.Sense = Sense = __decorate([
    (0, typeorm_1.Entity)('senses')
], Sense);
