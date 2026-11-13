import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export class AddSoftDeleteAndCascadeComment1794444000000
  implements MigrationInterface
{
  async up(queryRunner: QueryRunner): Promise<void> {
    // Archive principal records so their dependent history and references remain valid.
    await queryRunner.query(
      'ALTER TABLE `users` ADD COLUMN `deleted_at` datetime(3) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `arbol` ADD COLUMN `deleted_at` datetime(3) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `evento_ambiental` ADD COLUMN `deleted_at` datetime(3) NULL',
    );
    await queryRunner.query(
      'ALTER TABLE `logro` ADD COLUMN `deleted_at` datetime(3) NULL',
    );

    // Replaces the generated FK name without assuming TypeORM's naming strategy.
    await this.setDeleteAction(
      queryRunner,
      'comentario',
      'id_publicacion',
      'publicacion',
      'id_publicacion',
      'CASCADE',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await this.setDeleteAction(
      queryRunner,
      'comentario',
      'id_publicacion',
      'publicacion',
      'id_publicacion',
      'RESTRICT',
    );

    await queryRunner.query(
      'ALTER TABLE `logro` DROP COLUMN `deleted_at`',
    );
    await queryRunner.query(
      'ALTER TABLE `evento_ambiental` DROP COLUMN `deleted_at`',
    );
    await queryRunner.query(
      'ALTER TABLE `arbol` DROP COLUMN `deleted_at`',
    );
    await queryRunner.query(
      'ALTER TABLE `users` DROP COLUMN `deleted_at`',
    );
  }

  private async setDeleteAction(
    queryRunner: QueryRunner,
    tableName: string,
    columnName: string,
    referencedTable: string,
    referencedColumn: string,
    onDelete: 'CASCADE' | 'RESTRICT',
  ): Promise<void> {
    const table = await queryRunner.getTable(tableName);

    if (!table) {
      throw new Error(`No se encontró la tabla ${tableName}`);
    }

    const foreignKey = table.foreignKeys.find(
      (candidate) =>
        candidate.columnNames.length === 1 &&
        candidate.columnNames[0] === columnName &&
        candidate.referencedTableName === referencedTable &&
        candidate.referencedColumnNames[0] === referencedColumn,
    );

    if (!foreignKey) {
      throw new Error(
        `No se encontró la FK ${tableName}.${columnName} -> ${referencedTable}.${referencedColumn}`,
      );
    }

    if (foreignKey.onDelete?.toUpperCase() === onDelete) {
      return;
    }

    await queryRunner.dropForeignKey(table, foreignKey);
    await queryRunner.createForeignKey(
      table,
      new TableForeignKey({
        name: foreignKey.name,
        columnNames: foreignKey.columnNames,
        referencedTableName: referencedTable,
        referencedColumnNames: [referencedColumn],
        onDelete,
        onUpdate: foreignKey.onUpdate ?? 'NO ACTION',
      }),
    );
  }
}
