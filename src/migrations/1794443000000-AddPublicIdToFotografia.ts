import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPublicIdToFotografia1794443000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // Nullable conserva las filas antiguas hasta que sus public_id se reconcilien.
    await queryRunner.query(
      'ALTER TABLE `fotografia` ADD COLUMN `public_id` varchar(255) NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE `fotografia` DROP COLUMN `public_id`',
    );
  }
}
