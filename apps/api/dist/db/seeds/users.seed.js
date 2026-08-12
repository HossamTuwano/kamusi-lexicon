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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedUsers = seedUsers;
const database_1 = require("@kamusi/database");
const bcrypt = __importStar(require("bcrypt"));
async function seedUsers(dataSource) {
    const userRepo = dataSource.getRepository(database_1.User);
    console.log('Seeding admin user...');
    const adminPassword = 'admin123'; // Default credentials
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);
    const existingAdmin = await userRepo.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
        console.log('Admin user already exists, skipping...');
        return;
    }
    const admin = userRepo.create({
        username: 'admin',
        email: 'admin@kamusi.local',
        password_hash: adminHashedPassword,
        role: 'admin',
        reputation_score: 100,
    });
    await userRepo.save(admin);
    console.log(`✓ Admin user created (username: admin, password: ${adminPassword})`);
}
