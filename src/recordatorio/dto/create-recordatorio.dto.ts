// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Define los datos necesarios para registrar un recordatorio.
export class CreateRecordatorioDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  @ApiProperty({ example: 1 })
  id_arbol: number;

  // Valida el título del recordatorio.
  @IsString({ message: 'titulo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'titulo es obligatorio' })
  @ApiProperty({ example: 'Riego programado' })
  titulo: string;

  // Permite registrar una descripción opcional.
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @IsOptional()
  @ApiPropertyOptional({ example: 'Recordatorio de cuidado.' })
  descripcion?: string;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  @ApiProperty({ example: '2026-11-05', format: 'date' })
  fecha: string;

  // Valida la hora del recordatorio.
  @IsString({ message: 'hora debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'hora es obligatoria' })
  @ApiProperty({ example: '14:00:00' })
  hora: string;

  // Valida la configuración de repetición.
  @IsString({ message: 'repeticion debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'repeticion es obligatoria' })
  @ApiProperty({ example: 'ninguna' })
  repeticion: string;

  // Valida el estado actual del recordatorio.
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'estado es obligatorio' })
  @ApiProperty({ example: 'pendiente' })
  estado: string;
}
