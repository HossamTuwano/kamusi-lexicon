const { Client } = require('pg');

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL || process.env.DB_URL;
  if (!connectionString) {
    console.error('Error: DATABASE_URL not found');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to database. Starting schema initialization...');

    const sql = `
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lemmas_part_of_speech_enum') THEN
          CREATE TYPE lemmas_part_of_speech_enum AS ENUM (
            'NOUN', 'VERB', 'ADJECTIVE', 'ADVERB', 'PRONOUN', 'CONJUNCTION', 'PREPOSITION', 'INTERJECTION', 'OTHER'
          );
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS lemmas (
        id SERIAL PRIMARY KEY,
        word VARCHAR(255) NOT NULL,
        language VARCHAR(255) NOT NULL DEFAULT 'sw',
        part_of_speech lemmas_part_of_speech_enum NOT NULL DEFAULT 'NOUN',
        pronunciation VARCHAR(255),
        plural VARCHAR(255),
        synonyms TEXT[] DEFAULT '{}',
        antonyms TEXT[] DEFAULT '{}',
        derived_words TEXT[] DEFAULT '{}',
        dialect VARCHAR(255),
        source VARCHAR(255),
        is_verified BOOLEAN DEFAULT false,
        vote_count INTEGER DEFAULT 0,
        report_count INTEGER DEFAULT 0,
        is_hidden BOOLEAN DEFAULT false,
        creator_id INTEGER,
        version INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS senses (
        id SERIAL PRIMARY KEY,
        definition TEXT NOT NULL,
        usage_note TEXT,
        lemma_id INTEGER NOT NULL,
        CONSTRAINT fk_sense_lemma FOREIGN KEY (lemma_id) REFERENCES lemmas(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS examples (
        id SERIAL PRIMARY KEY,
        sentence TEXT NOT NULL,
        note TEXT,
        sense_id INTEGER NOT NULL,
        CONSTRAINT fk_example_sense FOREIGN KEY (sense_id) REFERENCES senses(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_lemma_word ON lemmas(word);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_lemma_word_pos ON lemmas(word, part_of_speech);
    `;

    await client.query(sql);
    console.log('Schema successfully initialized.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
