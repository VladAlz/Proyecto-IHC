import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1700000000000 implements MigrationInterface {
  name = 'InitialMigration1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "usability_tests" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "evaluatorName" character varying(255) NOT NULL,
        "taskDescription" text NOT NULL,
        "timeOnTask" double precision NOT NULL,
        "errorsCount" integer NOT NULL DEFAULT 0,
        "satisfactionScore" integer NOT NULL,
        "taskResult" character varying(20) NOT NULL,
        "observations" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "usability_findings" (
        "id" character varying(50) PRIMARY KEY,
        "severity" integer NOT NULL,
        "heuristicViolated" character varying(255) NOT NULL,
        "location" character varying(255) NOT NULL,
        "description" text NOT NULL,
        "recommendation" text NOT NULL,
        "theoreticalBasis" text
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_usability_tests_createdAt" ON "usability_tests" ("createdAt")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_usability_findings_severity" ON "usability_findings" ("severity")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "usability_findings"`);
    await queryRunner.query(`DROP TABLE "usability_tests"`);
  }
}
