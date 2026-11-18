// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Define los datos necesarios para registrar un comentario.
// La fecha se omite para que el cliente no pueda alterar la marca temporal del servidor.
export class CreateComentarioDto {
  // Valida el identificador del usuario relacionado.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  @ApiProperty({ example: 1 })
  id_usuario: number;

  // Valida el identificador de la publicación relacionada.
  @IsNumber({}, { message: 'id_publicacion debe ser un número' })
  @IsNotEmpty({ message: 'id_publicacion es obligatorio' })
  @ApiProperty({ example: 1 })
  id_publicacion: number;

  // Valida el contenido del comentario.
  @IsString({ message: 'comentario debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'comentario es obligatorio' })
  @ApiProperty({ example: 'Excelente crecimiento.' })
  comentario: string;

}
