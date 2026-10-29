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

// Define la tabla cuidado en la base de datos.
@Entity('cuidado')
export class Cuidado {
  // Genera automáticamente el identificador del cuidado.
  @PrimaryGeneratedColumn({ name: 'id_cuidado' })
  id_cuidado: number;

  // Almacena explícitamente la clave foránea del árbol relacionado.
  @Column({ name: 'id_arbol', nullable: false })
  id_arbol: number;

  // Define la relación de muchos cuidados hacia un árbol.
  @ManyToOne(() => Arbol, { nullable: false })
  // Usa id_arbol como columna de unión con la tabla arbol.
  @JoinColumn({ name: 'id_arbol' })
  // Almacena el árbol asociado al cuidado.
  arbol: Arbol;

  // Almacena el tipo de actividad de cuidado.
  @Column({ name: 'tipo_cuidado', nullable: false })
  tipo_cuidado: string;

  // Almacena la fecha programada para realizar el cuidado.
  @Column({ name: 'fecha_programada', type: 'date', nullable: false })
  fecha_programada: Date;

  // Almacena opcionalmente la fecha real de realización.
  @Column({ name: 'fecha_realizada', type: 'date', nullable: true })
  fecha_realizada: Date | null;

  // Almacena observaciones opcionales sobre la actividad.
  @Column({ name: 'observaciones', nullable: true })
  observaciones: string | null;

  // Almacena el estado actual del cuidado.
  @Column({ name: 'estado', nullable: false })
  estado: string;
}
