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

// Define la tabla recordatorio en la base de datos.
@Entity('recordatorio')
export class Recordatorio {
  // Genera automáticamente el identificador del recordatorio.
  @PrimaryGeneratedColumn({ name: 'id_recordatorio' })
  id_recordatorio: number;

  // Almacena explícitamente la clave foránea del árbol relacionado.
  @Column({ name: 'id_arbol', nullable: false })
  id_arbol: number;

  // Define la relación de muchos recordatorios hacia un árbol.
  @ManyToOne(() => Arbol, { nullable: false })
  // Usa id_arbol como columna de unión con la tabla arbol.
  @JoinColumn({ name: 'id_arbol' })
  // Almacena el árbol asociado al recordatorio.
  arbol: Arbol;

  // Almacena el título del recordatorio.
  @Column({ name: 'titulo', nullable: false })
  titulo: string;

  // Almacena una descripción opcional del recordatorio.
  @Column({ name: 'descripcion', nullable: true })
  descripcion: string | null;

  // Almacena la fecha programada para el recordatorio.
  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;

  // Almacena la hora programada para el recordatorio.
  @Column({ name: 'hora', type: 'time', nullable: false })
  hora: string;

  // Almacena la configuración de repetición.
  @Column({ name: 'repeticion', nullable: false })
  repeticion: string;

  // Almacena el estado actual del recordatorio.
  @Column({ name: 'estado', nullable: false })
  estado: string;
}
