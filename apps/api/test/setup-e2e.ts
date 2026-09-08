import { config } from 'dotenv';
import { resolve } from 'path';

/** Load before AppModule — Vitest hoists static imports above dotenv. */
config({ path: resolve(__dirname, '../.env.test'), override: true });

process.env.DB_HOST = process.env.DB_HOST ?? 'localhost';
process.env.REDIS_HOST = process.env.REDIS_HOST ?? 'localhost';

// Every test hits the API from the same IP; real rate limits would reject later
// tests no matter what they assert. Limits are verified separately.
process.env.THROTTLE_DISABLED = 'true';
