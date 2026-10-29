// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// Define los datos necesarios para registrar un cuidado.
export class CreateCuidadoDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  id_arbol: number;

  // Valida el tipo de actividad de cuidado.
  @IsString({ message: 'tipo_cuidado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'tipo_cuidado es obligatorio' })
  tipo_cuidado: string;

  // Valida que la fecha programada tenga un formato válido.
  @IsDateString(
    {},
    { message: 'fecha_programada debe tener un formato de fecha válido' },
  )
  @IsNotEmpty({ message: 'fecha_programada es obligatoria' })
  fecha_programada: string;

  // Permite registrar opcionalmente la fecha en que se realizó el cuidado.
  @IsDateString(
    {},
    { message: 'fecha_realizada debe tener un formato de fecha válido' },
  )
  @IsOptional()
  fecha_realizada?: string;

  // Permite registrar observaciones adicionales sobre el cuidado.
  @IsString({ message: 'observaciones debe ser una cadena de texto' })
  @IsOptional()
  observaciones?: string;

  // Valida el estado actual del cuidado.
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'estado es obligatorio' })
  estado: string;
}
