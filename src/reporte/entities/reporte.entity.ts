// Importa los decoradores de TypeORM para columnas, relaciones y restricciones.
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

// User es el usuario que el backend obtiene de la identidad autenticada.
import { User } from '../../user/entities/user.entity';

// Publicacion y Comentario son los dos tipos de contenido reportables.
import { Publicacion } from '../../publicacion/entities/publicacion.entity';
import { Comentario } from '../../comentario/entities/comentario.entity';

// Declara la tabla que conserva individualmente los reportes y sus motivos.
@Entity('reporte')

// Impide que el mismo usuario reporte dos veces la misma publicación.
@Unique('UQ_reporte_usuario_publicacion', ['id_usuario', 'id_publicacion'])

// Impide que el mismo usuario reporte dos veces el mismo comentario.
@Unique('UQ_reporte_usuario_comentario', ['id_usuario', 'id_comentario'])

// Garantiza que cada reporte tenga exactamente un objetivo y no quede huérfano.
@Check(
  'CHK_reporte_un_solo_objetivo',
  '(`id_publicacion` IS NOT NULL AND `id_comentario` IS NULL) OR ' +
    '(`id_publicacion` IS NULL AND `id_comentario` IS NOT NULL)',
)
export class Reporte {
  // Identificador único generado por la base de datos.
  @PrimaryGeneratedColumn({ name: 'id_reporte' })
  id_reporte: number;

  // Guarda la clave foránea del reportante para aplicar índices y unicidad.
  @Column({ name: 'id_usuario', type: 'int' })
  id_usuario: number;

  // Relaciona el reporte con el usuario identificado por el JWT.
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: User;

  // Guarda el ID de la publicación o NULL cuando se reporta un comentario.
  @Column({ name: 'id_publicacion', type: 'int', nullable: true })
  id_publicacion: number | null;

  // Relaciona opcionalmente el reporte con una publicación.
  @ManyToOne(() => Publicacion, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_publicacion' })
  publicacion: Publicacion | null;

  // Guarda el ID del comentario o NULL cuando se reporta una publicación.
  @Column({ name: 'id_comentario', type: 'int', nullable: true })
  id_comentario: number | null;

  // Relaciona opcionalmente el reporte con un comentario.
  @ManyToOne(() => Comentario, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_comentario' })
  comentario: Comentario | null;

  // Conserva el motivo que necesitan revisar los administradores.
  @Column({ name: 'motivo', type: 'text', nullable: false })
  motivo: string;

  // Registra automáticamente cuándo se creó el reporte, sin aceptar fecha del cliente.
  @CreateDateColumn({ name: 'fecha_reporte', type: 'timestamp' })
  fecha_reporte: Date;
}
