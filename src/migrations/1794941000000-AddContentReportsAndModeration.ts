import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Replaces the legacy report flags with auditable reports and moderation states.
 * Legacy flagged content is kept hidden because the former schema lacks reporter details.
 */
export class AddContentReportsAndModeration1794941000000
  implements MigrationInterface
{
  /** Creates report constraints and backfills moderation state before dropping legacy flags. */
  async up(queryRunner: QueryRunner): Promise<void> {
    // Store one report per authenticated user and target, with an automatic timestamp.
    await queryRunner.query(`
      CREATE TABLE \`reporte\` (
        \`id_reporte\` int NOT NULL AUTO_INCREMENT,
        \`id_usuario\` int NOT NULL,
        \`id_publicacion\` int NULL,
        \`id_comentario\` int NULL,
        \`motivo\` text NOT NULL,
        \`fecha_reporte\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id_reporte\`),
        UNIQUE KEY \`UQ_reporte_usuario_publicacion\` (\`id_usuario\`, \`id_publicacion\`),
        UNIQUE KEY \`UQ_reporte_usuario_comentario\` (\`id_usuario\`, \`id_comentario\`),
        CONSTRAINT \`CHK_reporte_un_solo_objetivo\`
          CHECK (
            (\`id_publicacion\` IS NOT NULL AND \`id_comentario\` IS NULL) OR
            (\`id_publicacion\` IS NULL AND \`id_comentario\` IS NOT NULL)
          ),
        CONSTRAINT \`FK_reporte_usuario\`
          FOREIGN KEY (\`id_usuario\`) REFERENCES \`users\` (\`id\`)
          ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT \`FK_reporte_publicacion\`
          FOREIGN KEY (\`id_publicacion\`) REFERENCES \`publicacion\` (\`id_publicacion\`)
          ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT \`FK_reporte_comentario\`
          FOREIGN KEY (\`id_comentario\`) REFERENCES \`comentario\` (\`id_comentario\`)
          ON DELETE CASCADE ON UPDATE NO ACTION
      ) ENGINE=InnoDB
    `);

    // Añade un estado explícito para que las consultas puedan ocultar contenido reportado.
    await queryRunner.query(
      "ALTER TABLE `publicacion` ADD COLUMN `estado_moderacion` enum('visible','oculto') NOT NULL DEFAULT 'visible'",
    );
    await queryRunner.query(
      "ALTER TABLE `comentario` ADD COLUMN `estado_moderacion` enum('visible','oculto') NOT NULL DEFAULT 'visible'",
    );

    // Conserva en revisión los elementos que ya estaban marcados con el booleano anterior.
    await queryRunner.query(
      "UPDATE `publicacion` SET `estado_moderacion` = IF(`reportado` = 1, 'oculto', 'visible')",
    );
    await queryRunner.query(
      "UPDATE `comentario` SET `estado_moderacion` = IF(`reportado` = 1, 'oculto', 'visible')",
    );

    // Elimina los campos simplificados una vez migrado su estado a la nueva columna.
    await queryRunner.query(
      'ALTER TABLE `publicacion` DROP COLUMN `fecha_reporte`, DROP COLUMN `reportado`',
    );
    await queryRunner.query(
      'ALTER TABLE `comentario` DROP COLUMN `fecha_reporte`, DROP COLUMN `reportado`',
    );
  }

  /** Restores legacy fields for rollback; individual historical reports cannot be reconstructed. */
  async down(queryRunner: QueryRunner): Promise<void> {
    // Recreates old columns before mapping hidden state back to the legacy boolean.
    await queryRunner.query(
      'ALTER TABLE `publicacion` ADD COLUMN `reportado` boolean NOT NULL DEFAULT false, ADD COLUMN `fecha_reporte` datetime NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `comentario` ADD COLUMN `reportado` boolean NOT NULL DEFAULT false, ADD COLUMN `fecha_reporte` datetime NULL',
    );

    // Preserves the fact that hidden content had been flagged before rollback.
    await queryRunner.query(
      "UPDATE `publicacion` SET `reportado` = IF(`estado_moderacion` = 'oculto', 1, 0)",
    );
    await queryRunner.query(
      "UPDATE `comentario` SET `reportado` = IF(`estado_moderacion` = 'oculto', 1, 0)",
    );

    // Removes new moderation states and report details after restoring the old schema.
    await queryRunner.query(
      'ALTER TABLE `comentario` DROP COLUMN `estado_moderacion`',
    );
    await queryRunner.query(
      'ALTER TABLE `publicacion` DROP COLUMN `estado_moderacion`',
    );
    await queryRunner.query('DROP TABLE `reporte`');
  }
}
