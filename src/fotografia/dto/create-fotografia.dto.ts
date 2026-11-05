// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Define los datos necesarios para registrar una fotografía.
export class CreateFotografiaDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  @ApiProperty({ example: 1 })
  id_arbol: number;

  // Valida la URL o ruta de la imagen.
  @IsString({ message: 'url_imagen debe ser una cadena de texto' })
  // Se conserva opcional porque la URL se genera exclusivamente en Cloudinary.
  @IsOptional()
  @ApiPropertyOptional({ description: 'Se genera automáticamente en Cloudinary.' })
  url_imagen?: string;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  @ApiProperty({ example: '2026-11-04T00:00:00.000Z', format: 'date-time' })
  fecha: string;

  // Permite registrar una descripción opcional de la fotografía.
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @IsOptional()
  @ApiPropertyOptional({ example: 'Crecimiento del árbol.' })
  descripcion?: string;
}
