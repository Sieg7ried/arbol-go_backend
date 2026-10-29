// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

// Define los datos necesarios para registrar un comentario.
export class CreateComentarioDto {
  // Valida el identificador del usuario relacionado.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  id_usuario: number;

  // Valida el identificador de la publicación relacionada.
  @IsNumber({}, { message: 'id_publicacion debe ser un número' })
  @IsNotEmpty({ message: 'id_publicacion es obligatorio' })
  id_publicacion: number;

  // Valida el contenido del comentario.
  @IsString({ message: 'comentario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'comentario es obligatorio' })
  comentario: string;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  fecha: string;
}
