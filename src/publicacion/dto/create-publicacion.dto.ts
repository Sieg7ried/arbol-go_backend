// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Define los datos necesarios para registrar una publicación.
export class CreatePublicacionDto {
  // Valida el identificador del usuario relacionado.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  @ApiProperty({ example: 1 })
  id_usuario: number;

  // Valida el título de la publicación.
  @IsString({ message: 'titulo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'titulo es obligatorio' })
  @ApiProperty({ example: 'Mi árbol favorito' })
  titulo: string;

  // Valida la descripción de la publicación.
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'descripcion es obligatoria' })
  @ApiProperty({ example: 'Observaciones sobre el árbol.' })
  descripcion: string;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  @ApiProperty({ example: '2026-11-04T00:00:00.000Z', format: 'date-time' })
  fecha: string;

  // Valida la URL o ruta de la imagen.
  @IsString({ message: 'imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'imagen es obligatoria' })
  @ApiProperty({ example: 'https://example.com/imagen.jpg' })
  imagen: string;
}
