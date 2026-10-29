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

// Define la tabla publicacion en la base de datos.
@Entity('publicacion')
export class Publicacion {
  // Genera automáticamente el identificador de la publicación.
  @PrimaryGeneratedColumn({ name: 'id_publicacion' })
  id_publicacion: number;

  // Almacena explícitamente la clave foránea del usuario relacionado.
  @Column({ name: 'id_usuario', nullable: false })
  id_usuario: number;

  // Define la relación de muchas publicaciones hacia un usuario.
  @ManyToOne(() => User, { nullable: false })
  // Usa id_usuario como columna de unión con la tabla users.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario que creó la publicación.
  usuario: User;

  // Almacena el título de la publicación.
  @Column({ name: 'titulo', nullable: false })
  titulo: string;

  // Almacena la descripción de la publicación.
  @Column({ name: 'descripcion', type: 'text', nullable: false })
  descripcion: string;

  // Almacena la fecha asociada a la publicación.
  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;

  // Almacena la URL o ruta de la imagen.
  @Column({ name: 'imagen', nullable: false })
  imagen: string;
}
