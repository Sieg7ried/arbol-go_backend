import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

// Decorador @Entity define que esta clase es una entidad de base de datos
@Entity('users')
export class User {
  // Clave primaria auto-incremental
  @PrimaryGeneratedColumn()
  id: number;

  // Columna de email única y no nula
  @Column({ unique: true, nullable: false })
  email: string;

  // Columna de contraseña (se guardará encriptada)
  // select: false evita que se lea por defecto en las consultas
  // @Exclude() evita que se envíe en las respuestas HTTP (ver sección 5)
  @Exclude()
  @Column({ nullable: false, select: false })
  password: string;

  // Nombre completo del usuario
  @Column({ nullable: false })
  fullName: string;

  // Almacena opcionalmente la foto de perfil del usuario.
  @Column({ nullable: true })
  foto_perfil: string | null;

  // Almacena el nivel actual del usuario.
  @Column({
    type: 'int',
    default: 1,
  })
  nivel: number;

  // Almacena la experiencia acumulada del usuario.
  @Column({
    type: 'int',
    default: 0,
  })
  experiencia: number;

  // Almacena los puntos acumulados del usuario.
  @Column({
    type: 'int',
    default: 0,
  })
  puntos: number;

  // Estado activo del usuario
  @Column({ default: true })
  isActive: boolean;

  // Rol del usuario (por defecto 'user')
  @Column({ default: 'user' })
  role: string;

  // Fecha de creación automática
  @CreateDateColumn()
  createdAt: Date;

  // Fecha de actualización automática
  @UpdateDateColumn()
  updatedAt: Date;
}