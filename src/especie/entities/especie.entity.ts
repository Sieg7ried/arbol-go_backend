import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  } from 'typeorm';

  // Decorador @Entity define que esta clase es una entidad de base de datos
@Entity('especie')
export class Especie {
  // Clave primaria auto-incremental
  @PrimaryGeneratedColumn()
  id: number;

   // Nombre común de la especie, no puede ser nulo
  @Column({ nullable: false })
  nombreComun: string;

   // Nombre completo de la especie, no puede ser nulo
  @Column({ nullable: false })
  nombreCientifico: string;

   // Frecuencia de riego de la especie, no puede ser nulo
  @Column({ nullable: false })
  frecuenciaRiego: number;
  
    // Frecuencia de poda de la especie, no puede ser nulo
  @Column({ nullable: false })
  frecuenciaPoda: number;

    // Frecuencia de fertilización de la especie, no puede ser nulo
  @Column({ nullable: false })
  frecuenciaFertilizacion: number;

      // Descripción de la especie, puede ser nulo
    @Column({ nullable: true })
    descripcion: string;

    // Fecha de creación del registro, se establece automáticamente al crear el registro
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    // Fecha de última actualización del registro, se actualiza automáticamente al modificar el registro
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;

}
