// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Importa la entidad Arbol para establecer la relación con el árbol.
import { Arbol } from '../../arbol/entities/arbol.entity';
import { Cuidado } from '../../cuidado/entities/cuidado.entity';

// Define la tabla recordatorio en la base de datos.
@Entity('recordatorio')
export class Recordatorio {
  // Genera automáticamente el identificador del recordatorio.
  @PrimaryGeneratedColumn({ name: 'id_recordatorio' })
  id_recordatorio: number;

  // Almacena explícitamente la clave foránea del árbol relacionado.
  @Column({ name: 'id_arbol', nullable: false })
  id_arbol: number;

  // Define la relación de muchos recordatorios hacia un árbol.
  @ManyToOne(() => Arbol, { nullable: false })
  // Usa id_arbol como columna de unión con la tabla arbol.
  @JoinColumn({ name: 'id_arbol' })
  // Almacena el árbol asociado al recordatorio.
  arbol: Arbol;

  // FK opcional; los recordatorios manuales no dependen de un cuidado.
  @Column({ name: 'id_cuidado', type: 'int', nullable: true })
  id_cuidado: number | null;

  // Muchos recordatorios pueden pertenecer a un cuidado; el borrado del cuidado los elimina en SQL.
  @ManyToOne(() => Cuidado, (cuidado) => cuidado.recordatorios, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cuidado', referencedColumnName: 'id_cuidado' })
  cuidado: Cuidado | null;

  // Almacena el título del recordatorio.
  @Column({ name: 'titulo', nullable: false })
  titulo: string;

  // Almacena una descripción opcional como texto compatible con MySQL.
  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  // Almacena la fecha programada para el recordatorio.
  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;

  // Almacena la hora programada para el recordatorio.
  @Column({ name: 'hora', type: 'time', precision: 3, nullable: false })
  hora: string;

  // Almacena la configuración de repetición.
  @Column({ name: 'repeticion', nullable: false })
  repeticion: string;

  // Almacena el estado actual del recordatorio.
  @Column({ name: 'estado', nullable: false })
  estado: string;

  // Guarda el día original del mes para que las repeticiones mensuales no deriven tras febrero.
  @Column({
    name: 'dia_repeticion',
    type: 'tinyint',
    unsigned: true,
    nullable: true,
  })
  dia_repeticion: number | null;

  // Marca cuándo se reclamó el recordatorio para que el cron recupere tareas abandonadas.
  @Column({
    name: 'procesando_desde',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  procesando_desde: Date | null;
}
