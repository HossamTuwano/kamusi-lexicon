import { config } from 'dotenv';
import { resolve } from 'path';

/** Load before AppModule — Vitest hoists static imports above dotenv. */
config({ path: resolve(__dirname, '../.env.test'), override: true });

process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';
