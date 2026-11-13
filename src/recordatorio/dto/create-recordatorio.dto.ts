// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoRecordatorioEnum } from '../../common/enums/estado-recordatorio.enum';
import { RepeticionEnum } from '../../common/enums/repeticion.enum';

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
  // IsEnum limita la frecuencia a las opciones con calendario implementado.
  @IsEnum(RepeticionEnum, {
    message: 'repeticion debe ser una frecuencia permitida',
  })
  @ApiProperty({
    enum: RepeticionEnum,
    example: RepeticionEnum.NINGUNA,
  })
  repeticion: RepeticionEnum;

  // Valida el estado actual del recordatorio.
  // IsEnum impide saltarse estados desconocidos en la cola del cron.
  @IsEnum(EstadoRecordatorioEnum, {
    message: 'estado debe ser un estado de recordatorio permitido',
  })
  @ApiProperty({
    enum: EstadoRecordatorioEnum,
    example: EstadoRecordatorioEnum.PENDIENTE,
  })
  estado: EstadoRecordatorioEnum;
}
