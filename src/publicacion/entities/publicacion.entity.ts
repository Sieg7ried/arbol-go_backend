// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Importa la entidad User para establecer la relación con el usuario.
import { User } from '../../user/entities/user.entity';
import { Reporte } from '../../reporte/entities/reporte.entity';

// Define la tabla publicacion en la base de datos.
@Entity('publicacion')
export class Publicacion {
  // Genera automáticamente el identificador de la publicación.
  @PrimaryGeneratedColumn({ name: 'id_publicacion' })
  id_publicacion: number;

  // Almacena explícitamente la clave foránea del usuario relacionado.
  @Column({ name: 'id_usuario', nullable: false })
  id_usuario: number;

  // El usuario se archiva para conservar la autoría; RESTRICT impide
  // eliminar físicamente una cuenta mientras esta relación exista.
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
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

  // TypeORM y MySQL generan la fecha de creación para impedir que dependa del cliente.
  @CreateDateColumn({ name: 'fecha', type: 'timestamp' })
  fecha: Date;

  // Almacena la URL o ruta de la imagen.
  @Column({ name: 'imagen', nullable: false })
  imagen: string;

  // Mantiene contenido reportado fuera de las consultas públicas hasta que se modere.
  @Column({
    name: 'estado_moderacion',
    type: 'enum',
    enum: ['visible', 'oculto'],
    default: 'visible',
  })
  estado_moderacion: 'visible' | 'oculto';

  // Permite consultar los reportes que se han asociado a esta publicación.
  @OneToMany(() => Reporte, (reporte) => reporte.publicacion)
  reportes: Reporte[];
}
