// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

// Importa la entidad Especie para establecer la relación con el árbol.
import { Especie } from '../../especie/entities/especie.entity';

// Importa la entidad User para establecer la relación con el árbol.
import { User } from '../../user/entities/user.entity';

// Define la tabla arbol en la base de datos.
@Entity('arbol')
export class Arbol {
  // Genera automáticamente el identificador numérico del árbol.
  @PrimaryGeneratedColumn({ name: 'id_arbol' })
  id_arbol: number;

  // Define la relación de muchos árboles hacia un usuario.
  @ManyToOne(() => User, { nullable: false })
  // Usa id_usuario como columna de unión con la tabla de usuarios.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario propietario del árbol.
  usuario: User;

  // Define la relación de muchos árboles hacia una especie.
  @ManyToOne(() => Especie, { nullable: false })
  // Usa id_especie como columna de unión con la tabla de especies.
  @JoinColumn({ name: 'id_especie' })
  // Almacena la especie correspondiente al árbol.
  especie: Especie;

  // Almacena el nombre asignado al árbol.
  @Column({ name: 'nombre', nullable: false })
  nombre: string;

  // Almacena la fecha en la que se sembró el árbol.
  @Column({ name: 'fecha_siembra', type: 'date', nullable: false })
  fecha_siembra: Date;

  // Almacena la edad actual del árbol.
  @Column({ name: 'edad', nullable: false })
  edad: number;

  // Almacena la altura actual del árbol con dos decimales.
  @Column({
    name: 'altura_actual',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  altura_actual: number;

  // Almacena el diámetro actual del tronco con dos decimales.
  @Column({
    name: 'diametro_tronco',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  diametro_tronco: number;

  // Almacena el estado de salud actual del árbol.
  @Column({ name: 'estado_salud', nullable: false })
  estado_salud: string;

  // Almacena el nivel de felicidad del árbol.
  @Column({ name: 'nivel_felicidad', nullable: false })
  nivel_felicidad: number;

  // Almacena el nivel de agua disponible para el árbol.
  @Column({ name: 'nivel_agua', nullable: false })
  nivel_agua: number;

  // Almacena el nivel de nutrientes disponible para el árbol.
  @Column({ name: 'nivel_nutrientes', nullable: false })
  nivel_nutrientes: number;

  // Almacena una descripción opcional del árbol.
  @Column({ name: 'descripcion', nullable: true })
  descripcion: string;

  // Almacena la latitud geográfica del árbol con siete decimales.
  @Column({
    name: 'latitud',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: false,
  })
  latitud: number;

  // Almacena la longitud geográfica del árbol con siete decimales.
  @Column({
    name: 'longitud',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: false,
  })
  longitud: number;

  // Registra automáticamente la fecha y hora de creación del árbol.
  @CreateDateColumn({
    name: 'fecha_registro',
    type: 'timestamp',
  })
  fecha_registro: Date;
}
