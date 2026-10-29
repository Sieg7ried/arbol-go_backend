// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

// Define los datos necesarios para registrar un historial de crecimiento.
export class CreateHistorialDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  id_arbol: number;

  // Valida que la fecha tenga un formato válido.
  @IsDateString({}, { message: 'fecha debe tener un formato válido' })
  @IsNotEmpty({ message: 'fecha es obligatoria' })
  fecha: string;

  // Valida que la altura sea un número no negativo.
  @IsNumber({}, { message: 'altura debe ser un número' })
  @Min(0, { message: 'La altura no puede ser negativa' })
  @IsNotEmpty({ message: 'La altura es obligatoria' })
  altura: number;

  // Valida que el diámetro sea un número no negativo.
  @IsNumber({}, { message: 'diametro debe ser un número' })
  @Min(0, { message: 'El diámetro no puede ser negativo' })
  @IsNotEmpty({ message: 'El diámetro es obligatorio' })
  diametro: number;

  // Permite registrar observaciones opcionales sobre el crecimiento.
  @IsString({ message: 'observaciones debe ser una cadena de texto' })
  @IsOptional()
  observaciones?: string;
}
