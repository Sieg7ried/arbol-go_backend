// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

// Importa la entidad Arbol para establecer la relación con el árbol.
import { Arbol } from '../../arbol/entities/arbol.entity';
import { Recordatorio } from '../../recordatorio/entities/recordatorio.entity';

// Define la tabla cuidado en la base de datos.
@Entity('cuidado')
export class Cuidado {
  // Genera automáticamente el identificador del cuidado.
  @PrimaryGeneratedColumn({ name: 'id_cuidado' })
  id_cuidado: number;

  // Almacena explícitamente la clave foránea del árbol relacionado.
  @Column({ name: 'id_arbol', nullable: false })
  id_arbol: number;

  // Define la relación de muchos cuidados hacia un árbol.
  @ManyToOne(() => Arbol, { nullable: false })
  // Usa id_arbol como columna de unión con la tabla arbol.
  @JoinColumn({ name: 'id_arbol' })
  // Almacena el árbol asociado al cuidado.
  arbol: Arbol;

  // Almacena el tipo de actividad de cuidado.
  @Column({ name: 'tipo_cuidado', nullable: false })
  tipo_cuidado: string;

  // DATETIME(3) conserva la hora; el valor se escribe y lee siguiendo la convención UTC de la aplicación.
  @Column({
    name: 'fecha_programada',
    type: 'datetime',
    precision: 3,
    nullable: false,
  })
  fecha_programada: Date;

  // Conserva también la hora real de ejecución cuando está disponible.
  @Column({
    name: 'fecha_realizada',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  fecha_realizada: Date | null;

  // Almacena observaciones opcionales como texto compatible con MySQL.
  // El tipo explícito evita que TypeORM infiera Object desde una unión nullable.
  @Column({
    name: 'observaciones',
    type: 'text',
    nullable: true,
  })
  observaciones: string;

  // Almacena el estado actual del cuidado.
  @Column({ name: 'estado', nullable: false })
  estado: string;

  // Indicador persistente que hace idempotente la recompensa incluso ante reintentos.
  // Exclude evita revelar al cliente un dato interno del proceso de gamificación.
  @Exclude()
  @Column({ name: 'recompensado', type: 'boolean', default: false })
  recompensado: boolean;

  // Relación inversa: la FK está en Recordatorio y permite cargar recordatorios asociados.
  @OneToMany(() => Recordatorio, (recordatorio) => recordatorio.cuidado)
  recordatorios: Recordatorio[];
}
