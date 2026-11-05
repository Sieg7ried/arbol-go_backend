// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Define los datos necesarios para registrar un historial de crecimiento.
export class CreateHistorialDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  @ApiProperty({ example: 1, description: 'ID del árbol relacionado.' })
  id_arbol: number;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  @ApiProperty({ example: '2026-11-04T00:00:00.000Z', format: 'date-time' })
  fecha: string;

  // Valida que la altura sea un número no negativo.
  @IsNumber({}, { message: 'altura debe ser un número' })
  @Min(0, { message: 'La altura no puede ser negativa' })
  @IsNotEmpty({ message: 'La altura es obligatoria' })
  @ApiProperty({ example: 2.45, minimum: 0 })
  altura: number;

  // Valida que el diámetro sea un número no negativo.
  @IsNumber({}, { message: 'diametro debe ser un número' })
  @Min(0, { message: 'El diámetro no puede ser negativo' })
  @IsNotEmpty({ message: 'El diámetro es obligatorio' })
  @ApiProperty({ example: 0.18, minimum: 0 })
  diametro: number;

  // Permite registrar observaciones opcionales sobre el crecimiento.
  @IsString({ message: 'observaciones debe ser una cadena de texto' })
  @IsOptional()
  @ApiPropertyOptional({ example: 'Crecimiento saludable.' })
  observaciones?: string;
}
