// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Importa la entidad User para establecer la relación con el usuario.
import { User } from '../../user/entities/user.entity';

// Importa la entidad Publicacion para establecer la relación con la publicación.
import { Publicacion } from '../../publicacion/entities/publicacion.entity';

// Define la tabla comentario en la base de datos.
@Entity('comentario')
export class Comentario {
  // Genera automáticamente el identificador del comentario.
  @PrimaryGeneratedColumn({ name: 'id_comentario' })
  id_comentario: number;

  // Almacena explícitamente la clave foránea del usuario relacionado.
  @Column({ name: 'id_usuario', nullable: false })
  id_usuario: number;

  // Define la relación de muchos comentarios hacia un usuario.
  @ManyToOne(() => User, { nullable: false })
  // Usa id_usuario como columna de unión con la tabla users.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario que escribió el comentario.
  usuario: User;

  // Almacena explícitamente la clave foránea de la publicación relacionada.
  @Column({ name: 'id_publicacion', nullable: false })
  id_publicacion: number;

  // Define la relación de muchos comentarios hacia una publicación.
  @ManyToOne(() => Publicacion, { nullable: false })
  // Usa id_publicacion como columna de unión con la tabla publicacion.
  @JoinColumn({ name: 'id_publicacion' })
  // Almacena la publicación comentada.
  publicacion: Publicacion;

  // Almacena el contenido del comentario.
  @Column({ name: 'comentario', type: 'text', nullable: false })
  comentario: string;

  // Almacena la fecha asociada al comentario.
  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;
}
