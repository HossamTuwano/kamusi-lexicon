/**
 * Reported/flagging state — run after Phase1Init1754490000000.
 * Local throwaway DBs may rely on DB_SYNC=true instead; shared envs use this.
 */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReportFlagging1754500000000 implements MigrationInterface {
  name = 'ReportFlagging1754500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE lemmas ADD COLUMN IF NOT EXISTS report_count int NOT NULL DEFAULT 0`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS lemma_reports (
        id SERIAL PRIMARY KEY,
        lemma_id int NOT NULL REFERENCES lemmas(id) ON DELETE CASCADE,
        user_id int NOT NULL,
        reason varchar NOT NULL,
        note text NULL,
        status varchar NOT NULL DEFAULT 'open',
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT uq_report_lemma_user UNIQUE (lemma_id, user_id)
      );
    `);

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS IDX_lemma_reports_status ON lemma_reports (status)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS lemma_reports`);
    await queryRunner.query(
      `ALTER TABLE lemmas DROP COLUMN IF EXISTS report_count`,
    );
  }
}
