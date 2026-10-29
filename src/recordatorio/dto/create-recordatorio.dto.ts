// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

// Define los datos necesarios para registrar un recordatorio.
export class CreateRecordatorioDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  id_arbol: number;

  // Valida el título del recordatorio.
  @IsString({ message: 'titulo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'titulo es obligatorio' })
  titulo: string;

  // Permite registrar una descripción opcional.
  @IsString({ message: 'descripcion debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  fecha: string;

  // Valida la hora del recordatorio.
  @IsString({ message: 'hora debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'hora es obligatoria' })
  hora: string;

  // Valida la configuración de repetición.
  @IsString({ message: 'repeticion debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'repeticion es obligatoria' })
  repeticion: string;

  // Valida el estado actual del recordatorio.
  @IsString({ message: 'estado debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'estado es obligatorio' })
  estado: string;
}
