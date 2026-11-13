import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

/**
 * Representa un usuario en persistencia.
 * La serialización excluye todo por defecto para impedir filtraciones desde
 * relaciones TypeORM y solo expone id, nombre completo y foto de perfil.
 */
@Exclude()
@Entity('users')
export class User {
  /** Identificador público permitido para reconocer al usuario en relaciones. */
  @Expose()
  @PrimaryGeneratedColumn()
  id: number;

  /** Correo privado: se conserva para autenticación, pero no se serializa desde esta entidad. */
  @Column({ unique: true, nullable: false })
  email: string;

  /** Contraseña privada: no se selecciona por defecto y tampoco se serializa. */
  @Column({ nullable: false, select: false })
  password: string;

  /** Nombre permitido en respuestas como dato básico de autoría. */
  @Expose()
  @Column({ nullable: false })
  fullName: string;

  /** Foto opcional permitida en respuestas para identificar visualmente al usuario. */
  @Expose()
  @Column({ type: 'varchar', length: 255, nullable: true })
  foto_perfil: string;

  /** Progreso interno: queda excluido de las respuestas de relaciones. */
  @Column({ type: 'int', default: 1 })
  nivel: number;

  /** Experiencia interna: queda excluida de las respuestas de relaciones. */
  @Column({ type: 'int', default: 0 })
  experiencia: number;

  /** Puntos internos: quedan excluidos de las respuestas de relaciones. */
  @Column({ type: 'int', default: 0 })
  puntos: number;

  /** Estado de cuenta privado: no se expone en respuestas públicas. */
  @Column({ default: true })
  isActive: boolean;

  /** Rol de autorización privado: no se expone en respuestas públicas. */
  @Column({ default: 'user' })
  role: string;

  /** Token privado de push: nunca se selecciona ni serializa por defecto. */
  @Index('UQ_users_fcm_token', { unique: true })
  @Column({
    name: 'fcm_token',
    type: 'varchar',
    length: 512,
    nullable: true,
    select: false,
  })
  fcmToken: string | null;

  /** Archiva la cuenta sin romper FKs ni borrar la autoría de su contenido. */
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt: Date | null;

  /** Fecha interna de creación: se excluye por minimización de datos expuestos. */
  @CreateDateColumn()
  createdAt: Date;

  /** Fecha interna de actualización: se excluye por minimización de datos expuestos. */
  @UpdateDateColumn()
  updatedAt: Date;
}
