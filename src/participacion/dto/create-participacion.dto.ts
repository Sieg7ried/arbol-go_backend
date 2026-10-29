// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
} from 'class-validator';

// Define los datos necesarios para registrar una participación.
export class CreateParticipacionDto {
  // Valida el identificador del usuario relacionado.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  id_usuario: number;

  // Valida el identificador del evento relacionado.
  @IsNumber({}, { message: 'id_evento debe ser un número' })
  @IsNotEmpty({ message: 'id_evento es obligatorio' })
  id_evento: number;

  // Valida que la fecha de inscripción tenga un formato válido.
  @IsDateString(
    {},
    { message: 'fecha_inscripcion debe tener un formato de fecha válido' },
  )
  @IsNotEmpty({ message: 'fecha_inscripcion es obligatoria' })
  fecha_inscripcion: string;

  // Valida si el usuario asistió al evento.
  @IsBoolean({ message: 'asistencia debe ser un valor booleano' })
  @IsNotEmpty({ message: 'asistencia es obligatoria' })
  asistencia: boolean;
}
