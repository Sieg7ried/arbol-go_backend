// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// Define los datos necesarios para registrar una fotografía.
export class CreateFotografiaDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  id_arbol: number;

  // Valida la URL o ruta de la imagen.
  @IsString({ message: 'url_imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'url_imagen es obligatoria' })
  url_imagen: string;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  fecha: string;

  // Permite registrar una descripción opcional de la fotografía.
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;
}
