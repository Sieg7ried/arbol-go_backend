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

// Importa la entidad Logro para establecer la relación con el logro.
import { Logro } from '../../logro/entities/logro.entity';

// Define la tabla intermedia usuario_logro en la base de datos.
@Entity('usuario_logro')
export class UsuarioLogro {
  // Define la primera parte de la clave primaria compuesta.
  @PrimaryColumn({ name: 'id_usuario' })
  id_usuario: number;

  // Define la relación de muchos registros hacia un usuario.
  @ManyToOne(() => User, { nullable: false })
  // Usa id_usuario como columna de unión con la tabla users.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario que obtuvo el logro.
  usuario: User;

  // Define la segunda parte de la clave primaria compuesta.
  @PrimaryColumn({ name: 'id_logro' })
  id_logro: number;

  // Define la relación de muchos registros hacia un logro.
  @ManyToOne(() => Logro, { nullable: false })
  // Usa id_logro como columna de unión con la tabla logro.
  @JoinColumn({ name: 'id_logro' })
  // Almacena el logro obtenido por el usuario.
  logro: Logro;

  // Almacena la fecha en que el usuario obtuvo el logro.
  @Column({ name: 'fecha_obtenido', type: 'date', nullable: false })
  fecha_obtenido: Date;
}
