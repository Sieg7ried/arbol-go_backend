// Importa los decoradores necesarios para definir la entidad y sus columnas.
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { EstadoSaludEnum } from '../../common/enums/estado-salud.enum';

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

  // La cuenta se archiva para conservar su autoría; RESTRICT evita que una
  // eliminación física externa deje árboles sin un propietario válido.
  @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
  // Usa id_usuario como columna de unión con la tabla de usuarios.
  @JoinColumn({ name: 'id_usuario' })
  // Almacena el usuario propietario del árbol.
  usuario: User;

  // La especie es un catálogo compartido y no debe borrar ni perder árboles.
  @ManyToOne(() => Especie, { nullable: false, onDelete: 'RESTRICT' })
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
  @Column({
    name: 'estado_salud',
    type: 'enum',
    enum: EstadoSaludEnum,
    default: EstadoSaludEnum.SALUDABLE,
  })
  estado_salud: EstadoSaludEnum;

  // Almacena el nivel de felicidad del árbol.
  @Column({ name: 'nivel_felicidad', nullable: false })
  nivel_felicidad: number;

  // Almacena el nivel de agua disponible para el árbol.
  @Column({ name: 'nivel_agua', nullable: false })
  nivel_agua: number;

  // Almacena el nivel de nutrientes disponible para el árbol.
  @Column({ name: 'nivel_nutrientes', nullable: false })
  nivel_nutrientes: number;

  // Almacena una descripción opcional como texto compatible con MySQL.
  @Column({ name: 'descripcion', type: 'text', nullable: true })
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

  // Archiva el árbol y conserva cuidados, fotos e historial; la fecha no se expone
  // en respuestas HTTP y TypeORM lo excluye de las consultas normales.
  @Exclude()
  @DeleteDateColumn({
    name: 'deleted_at',
    type: 'datetime',
    precision: 3,
    nullable: true,
  })
  deletedAt: Date | null;
}
