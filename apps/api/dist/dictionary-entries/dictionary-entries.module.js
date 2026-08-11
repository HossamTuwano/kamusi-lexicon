"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DictionaryEntriesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lemma_entity_1 = require("./entities/lemma.entity");
const sense_entity_1 = require("./entities/sense.entity");
const example_entity_1 = require("./entities/example.entity");
const lemma_contribution_entity_1 = require("./entities/lemma-contribution.entity");
const lemma_revision_entity_1 = require("./entities/lemma-revision.entity");
const dictionary_entries_service_1 = require("./dictionary-entries.service");
const dictionary_entries_controller_1 = require("./dictionary-entries.controller");
let DictionaryEntriesModule = class DictionaryEntriesModule {
};
exports.DictionaryEntriesModule = DictionaryEntriesModule;
exports.DictionaryEntriesModule = DictionaryEntriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                lemma_entity_1.Lemma,
                sense_entity_1.Sense,
                example_entity_1.Example,
                lemma_contribution_entity_1.LemmaContribution,
                lemma_revision_entity_1.LemmaRevision,
            ]),
        ],
        providers: [dictionary_entries_service_1.DictionaryEntriesService],
        controllers: [dictionary_entries_controller_1.DictionaryEntriesController],
        exports: [dictionary_entries_service_1.DictionaryEntriesService, typeorm_1.TypeOrmModule],
    })
], DictionaryEntriesModule);
