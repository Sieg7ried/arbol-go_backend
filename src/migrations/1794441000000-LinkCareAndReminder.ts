import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Preserves care timestamps and creates the optional care-reminder relationship.
 * Legacy reminders are linked only when their generated description identifies one care.
 */
export class LinkCareAndReminder1794441000000 implements MigrationInterface {
  /** Converts date storage, adds the nullable FK, and conservatively backfills generated reminders. */
  async up(queryRunner: QueryRunner): Promise<void> {
    // Keep scheduled and actual care instants, including milliseconds, instead of losing their time.
    await queryRunner.query(
      'ALTER TABLE `cuidado` MODIFY COLUMN `fecha_programada` datetime(3) NOT NULL, MODIFY COLUMN `fecha_realizada` datetime(3) NULL',
    );

    // Match reminder TIME precision with the care timestamp so automatic reminders retain milliseconds.
    await queryRunner.query(
      'ALTER TABLE `recordatorio` MODIFY COLUMN `hora` time(3) NOT NULL',
    );

    // Manual reminders remain valid because only automatic care reminders receive this nullable FK.
    await queryRunner.query(
      'ALTER TABLE `recordatorio` ADD COLUMN `id_cuidado` int NULL',
    );

    // Backfill only generated descriptions containing the exact care ID; ambiguous rows remain unlinked.
    await queryRunner.query(
      "UPDATE `recordatorio` r INNER JOIN `cuidado` c ON r.`id_arbol` = c.`id_arbol` AND r.`descripcion` = CONCAT('Recordatorio automático para el cuidado ', c.`id_cuidado`) SET r.`id_cuidado` = c.`id_cuidado`",
    );

    // Index the FK for efficient synchronization and database-level cascading deletion.
    await queryRunner.query(
      'CREATE INDEX `IDX_recordatorio_id_cuidado` ON `recordatorio` (`id_cuidado`)',
    );
    await queryRunner.query(
      'ALTER TABLE `recordatorio` ADD CONSTRAINT `FK_recordatorio_cuidado` FOREIGN KEY (`id_cuidado`) REFERENCES `cuidado`(`id_cuidado`) ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  /** Removes the relationship and restores the previous date/time column types. */
  async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the FK before its supporting index and column.
    await queryRunner.query(
      'ALTER TABLE `recordatorio` DROP FOREIGN KEY `FK_recordatorio_cuidado`',
    );
    await queryRunner.query(
      'DROP INDEX `IDX_recordatorio_id_cuidado` ON `recordatorio`',
    );
    await queryRunner.query(
      'ALTER TABLE `recordatorio` DROP COLUMN `id_cuidado`',
    );

    // A rollback necessarily discards stored time and millisecond precision.
    await queryRunner.query(
      'ALTER TABLE `recordatorio` MODIFY COLUMN `hora` time NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `cuidado` MODIFY COLUMN `fecha_programada` date NOT NULL, MODIFY COLUMN `fecha_realizada` date NULL',
    );
  }
}
