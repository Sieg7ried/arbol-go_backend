import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds stable achievement codes and migrates existing catalog rows.
 * The legacy names are interpreted only once here; runtime rules use codes exclusively.
 */
export class AddCodigoToLogro1794440000000 implements MigrationInterface {
  /** Adds the code column, backfills existing rows, then enforces uniqueness and presence. */
  async up(queryRunner: QueryRunner): Promise<void> {
    // Keep the new field nullable until every existing catalog row has been assigned a code.
    await queryRunner.query(
      'ALTER TABLE `logro` ADD COLUMN `codigo` varchar(50) NULL',
    );

    // Read rows in stable order so duplicate legacy labels receive deterministic unique codes.
    const filas = (await queryRunner.query(
      'SELECT `id_logro`, `nombre` FROM `logro` ORDER BY `id_logro` ASC',
    )) as Array<{ id_logro: number | string; nombre: string }>;
    const codigosUsados = new Set<string>();

    for (const fila of filas) {
      // Map known historical labels once; all other existing achievements get a safe legacy code.
      const nombreNormalizado = fila.nombre.trim().toLowerCase();
      const nivel = /^nivel\s+(\d+)$/.exec(nombreNormalizado)?.[1];
      let codigo =
        nombreNormalizado === 'primer cuidado completado'
          ? 'FIRST_CARE'
          : nivel
            ? `LEVEL_${Number(nivel)}`
            : `LEGACY_${fila.id_logro}`;

      // Preserve uniqueness even if the old catalog contains duplicate labels or levels.
      if (codigosUsados.has(codigo)) {
        codigo = `LEGACY_${fila.id_logro}`;
      }
      codigosUsados.add(codigo);

      // Bind values as parameters instead of interpolating catalog data into SQL.
      await queryRunner.query(
        'UPDATE `logro` SET `codigo` = ? WHERE `id_logro` = ?',
        [codigo, fila.id_logro],
      );
    }

    // Require a code on every catalog entry before adding the unique index.
    await queryRunner.query(
      'ALTER TABLE `logro` MODIFY COLUMN `codigo` varchar(50) NOT NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX `UQ_logro_codigo` ON `logro` (`codigo`)',
    );
  }

  /** Removes only the index and column introduced by this migration. */
  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX `UQ_logro_codigo` ON `logro`');
    await queryRunner.query('ALTER TABLE `logro` DROP COLUMN `codigo`');
  }
}
