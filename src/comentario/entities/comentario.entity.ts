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

  // El usuario se archiva para conservar la autoría del comentario.
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  // Usa id_usuario como columna de unión con la tabla users.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario que escribió el comentario.
  usuario: User;

  // Almacena explícitamente la clave foránea de la publicación relacionada.
  @Column({ name: 'id_publicacion', nullable: false })
  id_publicacion: number;

  // El comentario depende de la publicación; al borrar físicamente la
  // publicación, SQL elimina sus comentarios en la misma operación.
  @ManyToOne(() => Publicacion, { nullable: false, onDelete: 'CASCADE' })
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

  // Indica si el comentario fue reportado para revisión administrativa.
  @Column({ name: 'reportado', default: false })
  reportado: boolean;

  // Conserva la fecha UTC en que se recibió el reporte.
  @Column({ name: 'fecha_reporte', type: 'datetime', nullable: true })
  fecha_reporte: Date | null;
}
