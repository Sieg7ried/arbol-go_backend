// src/evento-ambiental/entities/evento-ambiental.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('evento_ambiental')
export class EventoAmbiental {
  @PrimaryGeneratedColumn()
  id: number;

  // Nombre de la campaña, obligatorio
  @Column({ nullable: false })
  nombre: string;

  // Descripción de la campaña, opcional
  @Column({ type: 'text', nullable: true })
  descripcion: string;

  // Fecha y hora en que se realiza el evento
  @Column({ type: 'datetime', nullable: false })
  fecha: Date;

  // Lugar donde se realiza
  @Column({ nullable: false })
  lugar: string;

  // Persona o entidad que organiza
  @Column({ nullable: false })
  organizador: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}