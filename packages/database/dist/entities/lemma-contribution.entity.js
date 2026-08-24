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
exports.LemmaContribution = exports.ContributionStatus = void 0;
const typeorm_1 = require("typeorm");
const core_1 = require("@kamusi/core");
const lemma_entity_1 = require("./lemma.entity");
var ContributionStatus;
(function (ContributionStatus) {
    ContributionStatus["PENDING"] = "pending";
    ContributionStatus["APPROVED"] = "approved";
    ContributionStatus["REJECTED"] = "rejected";
})(ContributionStatus || (exports.ContributionStatus = ContributionStatus = {}));
let LemmaContribution = class LemmaContribution {
};
exports.LemmaContribution = LemmaContribution;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LemmaContribution.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LemmaContribution.prototype, "lemma_id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], LemmaContribution.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], LemmaContribution.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ContributionStatus,
        default: ContributionStatus.PENDING,
    }),
    __metadata("design:type", String)
], LemmaContribution.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], LemmaContribution.prototype, "proposed_content", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LemmaContribution.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], LemmaContribution.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lemma_entity_1.Lemma, (lemma) => lemma.contributions, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'lemma_id' }),
    __metadata("design:type", lemma_entity_1.Lemma)
], LemmaContribution.prototype, "lemma", void 0);
exports.LemmaContribution = LemmaContribution = __decorate([
    (0, typeorm_1.Entity)('lemma_contributions')
], LemmaContribution);
