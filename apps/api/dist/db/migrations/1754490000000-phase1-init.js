"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Phase1Init1754490000000 = void 0;
class Phase1Init1754490000000 {
    constructor() {
        this.name = 'Phase1Init1754490000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
        await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE lemmas_part_of_speech_enum AS ENUM (
          'noun','verb','adjective','adverb','pronoun',
          'preposition','conjunction','interjection','idiom','phrase'
        );
      EXCEPTION WHEN duplicate_object THEN null;
      END $$;
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username varchar NOT NULL UNIQUE,
        email varchar NOT NULL UNIQUE,
        password_hash varchar NOT NULL,
        reputation_score int NOT NULL DEFAULT 0,
        role varchar NOT NULL DEFAULT 'contributor',
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lemmas (
        id SERIAL PRIMARY KEY,
        word varchar NOT NULL,
        language varchar NOT NULL DEFAULT 'sw',
        part_of_speech lemmas_part_of_speech_enum NOT NULL DEFAULT 'noun',
        pronunciation varchar NULL,
        plural varchar NULL,
        synonyms text[] NOT NULL DEFAULT '{}',
        antonyms text[] NOT NULL DEFAULT '{}',
        derived_words text[] NOT NULL DEFAULT '{}',
        dialect varchar NULL,
        source varchar NULL,
        is_verified boolean NOT NULL DEFAULT false,
        vote_count int NOT NULL DEFAULT 0,
        is_hidden boolean NOT NULL DEFAULT false,
        creator_id int NULL,
        version int NOT NULL DEFAULT 1,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT uq_lemmas_word_pos UNIQUE (word, part_of_speech)
      );
    `);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS IDX_lemmas_word ON lemmas (word)`);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS senses (
        id SERIAL PRIMARY KEY,
        definition text NOT NULL,
        usage_note text NULL,
        lemma_id int NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS examples (
        id SERIAL PRIMARY KEY,
        sentence text NOT NULL,
        note text NULL,
        sense_id int NOT NULL REFERENCES senses(id) ON DELETE CASCADE
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS verification_votes (
        id SERIAL PRIMARY KEY,
        entry_id int NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        user_id int NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type int NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT uq_vote_entry_user UNIQUE (entry_id, user_id)
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lemma_contributions (
        id SERIAL PRIMARY KEY,
        lemma_id int NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        user_id int NOT NULL,
        action varchar NOT NULL,
        note text NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lemma_revisions (
        id SERIAL PRIMARY KEY,
        lemma_id int NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        version int NOT NULL,
        snapshot jsonb NOT NULL,
        changed_by int NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS lemma_revisions`);
        await queryRunner.query(`DROP TABLE IF EXISTS lemma_contributions`);
        await queryRunner.query(`DROP TABLE IF EXISTS verification_votes`);
        await queryRunner.query(`DROP TABLE IF EXISTS examples`);
        await queryRunner.query(`DROP TABLE IF EXISTS senses`);
        await queryRunner.query(`DROP TABLE IF EXISTS lemmas`);
        await queryRunner.query(`DROP TABLE IF EXISTS users`);
        await queryRunner.query(`DROP TYPE IF EXISTS lemmas_part_of_speech_enum`);
    }
}
exports.Phase1Init1754490000000 = Phase1Init1754490000000;
