// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Define los datos necesarios para registrar una participación.
// La fecha de inscripción se omite para que solo la asigne el servidor al guardar.
export class CreateParticipacionDto {
  // Valida el identificador del usuario relacionado.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  @ApiProperty({ example: 1 })
  id_usuario: number;

  // Valida el identificador del evento relacionado.
  @IsNumber({}, { message: 'id_evento debe ser un número' })
  @IsNotEmpty({ message: 'id_evento es obligatorio' })
  @ApiProperty({ example: 1 })
  id_evento: number;

  // Valida si el usuario asistió al evento.
  @IsBoolean({ message: 'asistencia debe ser un valor booleano' })
  @IsNotEmpty({ message: 'asistencia es obligatoria' })
  @ApiProperty({ example: true })
  asistencia: boolean;
}
