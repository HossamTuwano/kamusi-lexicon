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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectContributionDto = exports.ApproveContributionDto = exports.CreateContributionDto = exports.ProposedExampleDto = exports.ProposedSenseDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const core_1 = require("@kamusi/core");
class ProposedSenseDto {
}
exports.ProposedSenseDto = ProposedSenseDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Maana pendekezwa inahitajika' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProposedSenseDto.prototype, "definition", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProposedSenseDto.prototype, "usageNote", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    __metadata("design:type", Array)
], ProposedSenseDto.prototype, "examples", void 0);
class ProposedExampleDto {
}
exports.ProposedExampleDto = ProposedExampleDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Sentensi ya mfano inahitajika' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProposedExampleDto.prototype, "sentence", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProposedExampleDto.prototype, "note", void 0);
class CreateContributionDto {
}
exports.CreateContributionDto = CreateContributionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Kitambulisho cha neno (lemmaId) kinahitajika' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateContributionDto.prototype, "lemmaId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Aina ya mchango inahitajika' }),
    (0, class_validator_1.IsEnum)(core_1.ContributionAction, { message: 'Aina ya mchango si sahihi' }),
    __metadata("design:type", typeof (_a = typeof core_1.ContributionAction !== "undefined" && core_1.ContributionAction) === "function" ? _a : Object)
], CreateContributionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContributionDto.prototype, "note", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProposedSenseDto),
    __metadata("design:type", Array)
], CreateContributionDto.prototype, "proposedSenses", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ProposedExampleDto),
    __metadata("design:type", Array)
], CreateContributionDto.prototype, "proposedExamples", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateContributionDto.prototype, "proposedText", void 0);
class ApproveContributionDto {
}
exports.ApproveContributionDto = ApproveContributionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ApproveContributionDto.prototype, "contributionId", void 0);
class RejectContributionDto {
}
exports.RejectContributionDto = RejectContributionDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Kitambulisho cha mchango kinahitajika' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], RejectContributionDto.prototype, "contributionId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Sababu ya kukataa inahitajika' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RejectContributionDto.prototype, "reason", void 0);
