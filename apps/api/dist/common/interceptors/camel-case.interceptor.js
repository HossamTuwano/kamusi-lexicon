"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CamelCaseInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const case_util_1 = require("../utils/case.util");
/** Serialize every successful JSON body to camelCase for frontend / @kamusi/core. */
let CamelCaseInterceptor = class CamelCaseInterceptor {
    intercept(_context, next) {
        return next.handle().pipe((0, rxjs_1.map)((data) => (0, case_util_1.toCamelCaseKeys)(data)));
    }
};
exports.CamelCaseInterceptor = CamelCaseInterceptor;
exports.CamelCaseInterceptor = CamelCaseInterceptor = __decorate([
    (0, common_1.Injectable)()
], CamelCaseInterceptor);
