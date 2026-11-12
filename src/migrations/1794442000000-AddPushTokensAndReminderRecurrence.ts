import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds private FCM token storage and the monthly recurrence anchor.
 * The schema remains compatible with users that have no registered device.
 */
export class AddPushTokensAndReminderRecurrence1794442000000 implements MigrationInterface {
  /** Adds nullable token storage and persists the current day for monthly reminders. */
  async up(queryRunner: QueryRunner): Promise<void> {
    // NULL permits users without a push device; the unique index enforces one owner per token.
    await queryRunner.query(
      'ALTER TABLE `users` ADD COLUMN `fcm_token` varchar(512) NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_users_fcm_token` ON `users` (`fcm_token`)',
    );

    // The day anchor preserves monthly schedules such as day 31 across shorter months.
    await queryRunner.query(
      'ALTER TABLE `recordatorio` ADD COLUMN `dia_repeticion` tinyint unsigned NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `recordatorio` ADD COLUMN `procesando_desde` datetime(3) NULL',
    );

    // Existing monthly reminders keep their current day as their initial recurrence anchor.
    await queryRunner.query(
      "UPDATE `recordatorio` SET `dia_repeticion` = DAY(`fecha`) WHERE LOWER(TRIM(`repeticion`)) = 'mensual'",
    );
  }

  /** Removes only the token and recurrence fields introduced by this migration. */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `UQ_users_fcm_token` ON `users`');
    await queryRunner.query('ALTER TABLE `users` DROP COLUMN `fcm_token`');
    await queryRunner.query(
      'ALTER TABLE `recordatorio` DROP COLUMN `dia_repeticion`',
    );
    await queryRunner.query(
      'ALTER TABLE `recordatorio` DROP COLUMN `procesando_desde`',
    );
  }
}
