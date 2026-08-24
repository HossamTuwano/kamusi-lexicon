"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const database_1 = require("@kamusi/database");
const bcrypt = __importStar(require("bcrypt"));
let UsersService = class UsersService {
    constructor(userRepository, contributionRepo) {
        this.userRepository = userRepository;
        this.contributionRepo = contributionRepo;
    }
    async create(username, email, pass) {
        const hashedPassword = await bcrypt.hash(pass, 10);
        const user = this.userRepository.create({
            username,
            email,
            password_hash: hashedPassword,
        });
        return this.userRepository.save(user);
    }
    async findByUsername(username) {
        return this.userRepository.findOne({ where: { username } });
    }
    async findById(id) {
        return this.userRepository.findOne({ where: { id } });
    }
    async findAll() {
        return this.userRepository.find({ order: { id: 'ASC' } });
    }
    /**
     * Promote/demote a user. Guards:
     * - actor cannot change their own role (prevents accidental self-lockout)
     * - the last admin cannot be demoted
     */
    async updateRole(id, role, actorId) {
        if (id === actorId) {
            throw new common_1.ForbiddenException('You cannot change your own role');
        }
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await this.userRepository.count({
                where: { role: 'admin' },
            });
            if (adminCount <= 1) {
                throw new common_1.BadRequestException('Cannot demote the last admin');
            }
        }
        user.role = role;
        return this.userRepository.save(user);
    }
    async updateReputation(userId, delta) {
        await this.userRepository.increment({ id: userId }, 'reputation_score', delta);
    }
    async getMyContributions(userId, status) {
        const query = this.contributionRepo
            .createQueryBuilder('contribution')
            .leftJoinAndSelect('contribution.lemma', 'lemma')
            .where('contribution.user_id = :userId', { userId });
        if (status) {
            query.andWhere('contribution.status = :status', { status });
        }
        return query.orderBy('contribution.created_at', 'DESC').getMany();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(database_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(database_1.LemmaContribution)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
