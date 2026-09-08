const { Client } = require('pg');
const bcrypt = require('bcrypt');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL not found');
    process.exit(1);
  }

  const useSsl =
    connectionString.includes('render.com') ||
    process.env.NODE_ENV === 'production' ||
    process.env.DB_SSL === 'true';

  const client = new Client({
    connectionString,
    ssl: useSsl ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('Connected to database. Starting schema initialization...');

    // 1. Extensions
    await client.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');

    // 2. Swahili POS Enum
    const enumCheck = await client.query(
      "SELECT enumlabel FROM pg_enum JOIN pg_type ON pg_enum.enumtypid = pg_type.oid WHERE typname = 'lemmas_part_of_speech_enum';"
    );
    const existingLabels = enumCheck.rows.map((r) => r.enumlabel);
    const needsEnumReset =
      existingLabels.length > 0 && !existingLabels.includes('N');

    if (needsEnumReset) {
      console.log('Converting legacy POS enum to Swahili codes (N, W, V, T, E, U, I, H)...');
      await client.query(`
        DO $$ BEGIN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'lemmas' AND column_name = 'part_of_speech'
          ) THEN
            ALTER TABLE lemmas ALTER COLUMN part_of_speech DROP DEFAULT;
            ALTER TABLE lemmas ALTER COLUMN part_of_speech TYPE varchar;
          END IF;
          DROP TYPE IF EXISTS lemmas_part_of_speech_enum CASCADE;
          CREATE TYPE lemmas_part_of_speech_enum AS ENUM ('N','W','V','T','E','U','I','H');
          IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'lemmas' AND column_name = 'part_of_speech'
          ) THEN
            ALTER TABLE lemmas ALTER COLUMN part_of_speech TYPE lemmas_part_of_speech_enum USING 'N'::lemmas_part_of_speech_enum;
            ALTER TABLE lemmas ALTER COLUMN part_of_speech SET DEFAULT 'N';
          END IF;
        END $$;
      `);
    } else if (existingLabels.length === 0) {
      await client.query(`
        DO $$ BEGIN
          CREATE TYPE lemmas_part_of_speech_enum AS ENUM ('N','W','V','T','E','U','I','H');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
      `);
    }

    // 3. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        reputation_score INT NOT NULL DEFAULT 0,
        role VARCHAR(50) NOT NULL DEFAULT 'contributor',
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 4. Lemmas Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lemmas (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        language VARCHAR(10) NOT NULL DEFAULT 'sw',
        part_of_speech lemmas_part_of_speech_enum NOT NULL DEFAULT 'N',
        pronunciation VARCHAR(255),
        plural VARCHAR(255),
        synonyms TEXT[] NOT NULL DEFAULT '{}',
        antonyms TEXT[] NOT NULL DEFAULT '{}',
        derived_words TEXT[] NOT NULL DEFAULT '{}',
        dialect VARCHAR(255),
        source VARCHAR(255),
        is_verified BOOLEAN NOT NULL DEFAULT false,
        vote_count INT NOT NULL DEFAULT 0,
        report_count INT NOT NULL DEFAULT 0,
        is_hidden BOOLEAN DEFAULT false,
        creator_id INT,
        version INT NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT uq_lemmas_word_pos UNIQUE (word, part_of_speech)
      );
      CREATE INDEX IF NOT EXISTS idx_lemmas_word ON lemmas(word);
      -- Search uses trigram similarity (word % :q), which the btree index above
      -- cannot serve. Without this GIN index every search is a sequential scan.
      CREATE INDEX IF NOT EXISTS idx_lemmas_word_trgm ON lemmas USING gin (word gin_trgm_ops);
      ALTER TABLE lemmas ADD COLUMN IF NOT EXISTS report_count INT NOT NULL DEFAULT 0;
    `);

    // 5. Senses Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS senses (
        id SERIAL PRIMARY KEY,
        definition TEXT NOT NULL,
        usage_note TEXT,
        lemma_id INT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE
      );
    `);

    // 6. Examples Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS examples (
        id SERIAL PRIMARY KEY,
        sentence TEXT NOT NULL,
        note TEXT,
        sense_id INT NOT NULL REFERENCES senses(id) ON DELETE CASCADE
      );
    `);

    // 7. Verification Votes Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS verification_votes (
        id SERIAL PRIMARY KEY,
        entry_id INT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT uq_vote_entry_user UNIQUE (entry_id, user_id)
      );
    `);

    // 8. Lemma Contributions Table and Status Enum
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE lemma_contributions_status_enum AS ENUM ('pending', 'approved', 'rejected');
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;

      CREATE TABLE IF NOT EXISTS lemma_contributions (
        id SERIAL PRIMARY KEY,
        lemma_id INT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        status lemma_contributions_status_enum NOT NULL DEFAULT 'pending',
        proposed_content JSONB,
        note TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    // 9. Lemma Reports Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lemma_reports (
        id SERIAL PRIMARY KEY,
        lemma_id INT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        reason VARCHAR(50) NOT NULL,
        note TEXT,
        status VARCHAR(50) NOT NULL DEFAULT 'open',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT uq_report_lemma_user UNIQUE (lemma_id, user_id)
      );
      CREATE INDEX IF NOT EXISTS idx_lemma_reports_status ON lemma_reports(status);
    `);

    // 10. Lemma Revisions Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lemma_revisions (
        id SERIAL PRIMARY KEY,
        lemma_id INT NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        version INT NOT NULL,
        snapshot JSONB NOT NULL,
        changed_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);

    console.log('Database schema successfully verified and up to date.');

    // 11. Seed Admin User
    const adminUsername = process.env.ADMIN_USERNAME || 'hossam';
    const adminEmail = process.env.ADMIN_EMAIL || 'hossamtuwano@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD;

    const existingAdmin = await client.query(
      'SELECT id, username, role FROM users WHERE username = $1;',
      [adminUsername]
    );

    let adminId;
    if (existingAdmin.rows.length === 0) {
      // No default password: seeding a known credential would leave every fresh
      // deployment with a guessable admin account.
      if (!adminPassword) {
        console.error(
          `Cannot create super admin "${adminUsername}": ADMIN_PASSWORD is not set.`
        );
        console.error(
          'Set ADMIN_PASSWORD in the environment (apps/api/.env locally, or the host dashboard in production) and run again.'
        );
        process.exit(1);
      }
      console.log(`Creating super admin user "${adminUsername}"...`);
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      const inserted = await client.query(
        `INSERT INTO users (username, email, password_hash, reputation_score, role)
         VALUES ($1, $2, $3, 100, 'admin')
         RETURNING id;`,
        [adminUsername, adminEmail, passwordHash]
      );
      adminId = inserted.rows[0].id;
      console.log(`Super admin user "${adminUsername}" created with ID ${adminId}.`);
    } else {
      adminId = existingAdmin.rows[0].id;
      console.log(`Admin user "${adminUsername}" already exists (ID ${adminId}).`);
    }

    // 12. Baseline Seed (if no lemmas exist)
    const lemmaCount = await client.query('SELECT count(*) FROM lemmas;');
    if (parseInt(lemmaCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial baseline entry ("gari")...');
      const lemmaRes = await client.query(
        `INSERT INTO lemmas (
          word, language, part_of_speech, plural, synonyms, antonyms, derived_words,
          dialect, source, is_verified, vote_count, creator_id, version
        ) VALUES (
          'gari', 'sw', 'N', 'magari', ARRAY['motokaa'], ARRAY[]::text[], ARRAY['dereva', 'garini'],
          'Kiswahili sanifu', 'seed', true, 1, $1, 1
        ) RETURNING id;`,
        [adminId]
      );
      const lemmaId = lemmaRes.rows[0].id;

      const sense1Res = await client.query(
        `INSERT INTO senses (definition, usage_note, lemma_id)
         VALUES ('Chombo cha usafiri kinachotumika kubeba watu au mizigo.', 'Hutumika mara nyingi kwa magari ya kisasa.', $1)
         RETURNING id;`,
        [lemmaId]
      );
      const sense1Id = sense1Res.rows[0].id;

      const sense2Res = await client.query(
        `INSERT INTO senses (definition, usage_note, lemma_id)
         VALUES ('Kaa au gari la kubebea mizigo kwa kutumia wanyama.', 'Matumizi ya kimila au maalum.', $1)
         RETURNING id;`,
        [lemmaId]
      );
      const sense2Id = sense2Res.rows[0].id;

      await client.query(
        `INSERT INTO examples (sentence, note, sense_id)
         VALUES ('Nimenunua gari jipya.', 'Matumizi ya kawaida', $1);`,
        [sense1Id]
      );

      await client.query(
        `INSERT INTO examples (sentence, note, sense_id)
         VALUES ('Gari la kubeba mizigo limefika.', 'Matumizi ya muktadha', $1);`,
        [sense2Id]
      );

      await client.query(
        `INSERT INTO lemma_contributions (lemma_id, user_id, action, status, note)
         VALUES ($1, $2, 'created', 'approved', 'Initial baseline seed');`,
        [lemmaId, adminId]
      );

      console.log('Baseline entry ("gari") seeded successfully.');
    } else {
      console.log(`Database already has ${lemmaCount.rows[0].count} lemmas; skipping baseline seed.`);
    }

    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
