// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Importa la entidad Arbol para establecer la relación con el árbol.
import { Arbol } from '../../arbol/entities/arbol.entity';

// Define la tabla historial en la base de datos.
@Entity('historial')
export class Historial {
  // Genera automáticamente el identificador del historial.
  @PrimaryGeneratedColumn({ name: 'id_historial' })
  id_historial: number;

  // Almacena explícitamente la clave foránea del árbol relacionado.
  @Column({ name: 'id_arbol', nullable: false })
  id_arbol: number;

  // Define la relación de muchos historiales hacia un árbol.
  @ManyToOne(() => Arbol, { nullable: false })
  // Usa id_arbol como columna de unión con la tabla arbol.
  @JoinColumn({ name: 'id_arbol' })
  // Almacena el árbol asociado al registro histórico.
  arbol: Arbol;

  // Almacena la fecha de la medición del crecimiento.
  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;

  // Almacena la altura registrada del árbol.
  @Column({
    name: 'altura',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  altura: number;

  // Almacena el diámetro registrado del árbol.
  @Column({
    name: 'diametro',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  diametro: number;

  // Almacena observaciones opcionales sobre el crecimiento.
  @Column({ name: 'observaciones', nullable: true })
  observaciones: string | null;
}
