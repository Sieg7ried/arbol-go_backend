import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

// Representa el catálogo de insignias de gamificación persistido en la tabla "logro".
// El índice con nombre explícito coincide con la restricción creada por la migración.
@Index('UQ_logro_codigo', ['codigo'], { unique: true })
@Entity('logro')
export class Logro {
  // Identificador numérico interno del registro.
  @PrimaryGeneratedColumn({ name: 'id_logro' })
  id: number;

  // Código de máquina único que mantiene estable la lógica aunque cambie el nombre visible.
  @Column({ name: 'codigo', type: 'varchar', length: 50 })
  codigo: string;

  // Etiqueta visible que se puede cambiar o traducir sin afectar la lógica de negocio.
  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  // Descripción visible del logro.
  @Column({ type: 'text', nullable: false })
  descripcion: string;

  // Puntos que se otorgan cuando se registra el logro.
  @Column({ name: 'puntos_otorgados', type: 'int', nullable: false })
  puntos_otorgados: number;

  // URL o ruta de la insignia.
  @Column({ type: 'varchar', length: 255, nullable: false })
  imagen: string;
}
