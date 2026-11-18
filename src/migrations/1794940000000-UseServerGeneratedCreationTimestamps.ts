import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Converts creation-date columns to server-generated timestamps.
 * The application connection uses UTC so MySQL timestamp conversion is consistent.
 */
export class UseServerGeneratedCreationTimestamps1794940000000
  implements MigrationInterface
{
  /** Preserves existing dates while enabling a database-generated timestamp on new rows. */
  async up(queryRunner: QueryRunner): Promise<void> {
    // Let MySQL assign the publication creation instant and retain time precision.
    await queryRunner.query(
      'ALTER TABLE `publicacion` MODIFY COLUMN `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );

    // Let MySQL assign the comment creation instant and retain time precision.
    await queryRunner.query(
      'ALTER TABLE `comentario` MODIFY COLUMN `fecha` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );

    // Let MySQL assign the participation registration instant.
    await queryRunner.query(
      'ALTER TABLE `participacion` MODIFY COLUMN `fecha_inscripcion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );

    // Let MySQL assign the moment when a user obtains a logro.
    await queryRunner.query(
      'ALTER TABLE `usuario_logro` MODIFY COLUMN `fecha_obtenido` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
    );
  }

  /** Restores the previous date-only schema if the migration is rolled back. */
  async down(queryRunner: QueryRunner): Promise<void> {
    // Restoring DATE necessarily discards the time portion of each timestamp.
    await queryRunner.query(
      'ALTER TABLE `usuario_logro` MODIFY COLUMN `fecha_obtenido` date NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `participacion` MODIFY COLUMN `fecha_inscripcion` date NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `comentario` MODIFY COLUMN `fecha` date NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `publicacion` MODIFY COLUMN `fecha` date NOT NULL',
    );
  }
}
