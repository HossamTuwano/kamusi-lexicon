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
const database_1 = require("@kamusi/database");
const dictionary_entries_service_1 = require("./dictionary-entries.service");
const dictionary_entries_controller_1 = require("./dictionary-entries.controller");
let DictionaryEntriesModule = class DictionaryEntriesModule {
};
exports.DictionaryEntriesModule = DictionaryEntriesModule;
exports.DictionaryEntriesModule = DictionaryEntriesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                database_1.Lemma,
                database_1.Sense,
                database_1.Example,
                database_1.LemmaContribution,
                database_1.LemmaRevision,
                database_1.LemmaReport,
            ]),
        ],
        providers: [dictionary_entries_service_1.DictionaryEntriesService],
        controllers: [dictionary_entries_controller_1.DictionaryEntriesController],
        exports: [dictionary_entries_service_1.DictionaryEntriesService, typeorm_1.TypeOrmModule],
    })
], DictionaryEntriesModule);
