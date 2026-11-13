import { MigrationInterface, QueryRunner } from 'typeorm';

interface EnumColumnDefinition {
  table: string;
  column: string;
  values: readonly string[];
  defaultValue: string;
}

const ENUM_COLUMNS: readonly EnumColumnDefinition[] = [
  {
    table: 'arbol',
    column: 'estado_salud',
    values: ['saludable', 'requiere_atencion'],
    defaultValue: 'saludable',
  },
  {
    table: 'cuidado',
    column: 'tipo_cuidado',
    values: ['riego', 'poda', 'abono'],
    defaultValue: 'riego',
  },
  {
    table: 'cuidado',
    column: 'estado',
    values: ['pendiente', 'vencido', 'completado'],
    defaultValue: 'pendiente',
  },
  {
    table: 'recordatorio',
    column: 'repeticion',
    values: ['ninguna', 'diaria', 'semanal', 'mensual'],
    defaultValue: 'ninguna',
  },
  {
    table: 'recordatorio',
    column: 'estado',
    values: ['pendiente', 'pendiente_atencion', 'procesando', 'cancelado'],
    defaultValue: 'pendiente',
  },
];

export class ConvertCareFieldsToEnums1794445000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // Validate every column before modifying any data or schema so unsupported
    // legacy values are reported for explicit cleanup instead of being truncated.
    for (const definition of ENUM_COLUMNS) {
      await this.assertValuesAreSupported(queryRunner, definition);
    }

    // Normalize historical casing and whitespace only after all values pass preflight.
    for (const { table, column } of ENUM_COLUMNS) {
      await queryRunner.query(
        `UPDATE \`${table}\` SET \`${column}\` = LOWER(TRIM(\`${column}\`))`,
      );
    }

    // Convert each validated string column to a strict MySQL ENUM with a domain default.
    for (const definition of ENUM_COLUMNS) {
      const enumValues = definition.values.map((value) => `'${value}'`).join(', ');
      await queryRunner.query(
        `ALTER TABLE \`${definition.table}\` MODIFY COLUMN \`${definition.column}\` enum(${enumValues}) NOT NULL DEFAULT '${definition.defaultValue}'`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Restore string storage while retaining normalized values for old application versions.
    for (const { table, column } of ENUM_COLUMNS) {
      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY COLUMN \`${column}\` varchar(255) NOT NULL`,
      );
    }
  }

  private async assertValuesAreSupported(
    queryRunner: QueryRunner,
    definition: EnumColumnDefinition,
  ): Promise<void> {
    const rows: Array<{ value: string }> = await queryRunner.query(
      `SELECT DISTINCT LOWER(TRIM(\`${definition.column}\`)) AS \`value\` FROM \`${definition.table}\``,
    );
    const invalidValues = rows
      .map((row) => row.value)
      .filter((value) => !definition.values.includes(value));

    if (invalidValues.length > 0) {
      throw new Error(
        `No se puede convertir ${definition.table}.${definition.column} a ENUM. ` +
          `Valores no permitidos: ${[...new Set(invalidValues)].join(', ')}. ` +
          `Valores válidos: ${definition.values.join(', ')}.`,
      );
    }
  }
}
