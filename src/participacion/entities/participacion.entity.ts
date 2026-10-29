// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

// Importa la entidad User para establecer la relación con el usuario.
import { User } from '../../user/entities/user.entity';

// Importa la entidad del evento ambiental relacionado.
import { EventoAmbiental } from '../../evento-ambiental/entities/evento-ambiental.entity';

// Define la tabla intermedia participacion en la base de datos.
@Entity('participacion')
export class Participacion {
  // Define la primera parte de la clave primaria compuesta.
  @PrimaryColumn({ name: 'id_usuario' })
  id_usuario: number;

  // Define la relación de muchos registros hacia un usuario.
  @ManyToOne(() => User, { nullable: false })
  // Usa id_usuario como columna de unión con la tabla users.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario que participa en el evento.
  usuario: User;

  // Define la segunda parte de la clave primaria compuesta.
  @PrimaryColumn({ name: 'id_evento' })
  id_evento: number;

  // Define la relación de muchos registros hacia un evento ambiental.
  @ManyToOne(() => EventoAmbiental, { nullable: false })
  // Usa id_evento como columna de unión con la tabla evento_ambiental.
  @JoinColumn({ name: 'id_evento' })
  // Almacena el evento en el que participa el usuario.
  evento: EventoAmbiental;

  // Almacena la fecha en que se inscribió el usuario.
  @Column({ name: 'fecha_inscripcion', type: 'date', nullable: false })
  fecha_inscripcion: Date;

  // Almacena si el usuario asistió al evento.
  @Column({ name: 'asistencia', type: 'boolean', nullable: false })
  asistencia: boolean;
}
