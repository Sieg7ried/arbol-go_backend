// Importa los validadores necesarios para comprobar los datos recibidos.
import { IsDateString, IsNotEmpty, IsNumber } from 'class-validator';

// Define los datos necesarios para registrar un logro obtenido por un usuario.
export class CreateUsuarioLogroDto {
  // Valida el identificador del usuario relacionado.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  id_usuario: number;

  // Valida el identificador del logro relacionado.
  @IsNumber({}, { message: 'id_logro debe ser un número' })
  @IsNotEmpty({ message: 'id_logro es obligatorio' })
  id_logro: number;

  // Valida que la fecha de obtención tenga un formato válido.
  @IsDateString(
    {},
    { message: 'fecha_obtenido debe tener un formato de fecha válido' },
  )
  @IsNotEmpty({ message: 'fecha_obtenido es obligatoria' })
  fecha_obtenido: string;
}
