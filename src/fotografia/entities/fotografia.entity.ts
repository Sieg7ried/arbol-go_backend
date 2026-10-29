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

// Define la tabla fotografia en la base de datos.
@Entity('fotografia')
export class Fotografia {
  // Genera automáticamente el identificador de la fotografía.
  @PrimaryGeneratedColumn({ name: 'id_foto' })
  id_foto: number;

  // Almacena explícitamente la clave foránea del árbol relacionado.
  @Column({ name: 'id_arbol', nullable: false })
  id_arbol: number;

  // Define la relación de muchas fotografías hacia un árbol.
  @ManyToOne(() => Arbol, { nullable: false })
  // Usa id_arbol como columna de unión con la tabla arbol.
  @JoinColumn({ name: 'id_arbol' })
  // Almacena el árbol asociado a la fotografía.
  arbol: Arbol;

  // Almacena la URL o ruta de la imagen.
  @Column({ name: 'url_imagen', nullable: false })
  url_imagen: string;

  // Almacena la fecha asociada a la fotografía.
  @Column({ name: 'fecha', type: 'date', nullable: false })
  fecha: Date;

  // Almacena una descripción opcional de la fotografía.
  @Column({ name: 'descripcion', nullable: true })
  descripcion: string | null;
}
