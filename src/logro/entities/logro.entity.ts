import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Entidad Logro: catálogo de insignias de gamificación (tabla "logro")
@Entity('logro')
export class Logro {
  // PK: id_logro
  @PrimaryGeneratedColumn({ name: 'id_logro' })
  id: number;

  // Nombre del logro
  @Column({ type: 'varchar', length: 100, nullable: false })
  nombre: string;

  // Descripción del logro
  @Column({ type: 'text', nullable: false })
  descripcion: string;

  // Puntos que se otorgan al obtener el logro
  @Column({ name: 'puntos_otorgados', type: 'int', nullable: false })
  puntos_otorgados: number;

  // Imagen (URL o ruta) de la insignia
  @Column({ type: 'varchar', length: 255, nullable: false })
  imagen: string;
}
