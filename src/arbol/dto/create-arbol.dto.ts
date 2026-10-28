// Importa validadores para comprobar los datos recibidos al crear un árbol.
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// Define los datos necesarios para registrar un árbol.
export class CreateArbolDto {
  // Valida el identificador del usuario propietario.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  id_usuario: number;

  // Valida el identificador de la especie del árbol.
  @IsNumber({}, { message: 'id_especie debe ser un número' })
  @IsNotEmpty({ message: 'id_especie es obligatorio' })
  id_especie: number;

  // Valida el nombre del árbol.
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  // Valida que la fecha de siembra tenga un formato de fecha válido.
  @IsDateString(
    {},
    { message: 'fecha_siembra debe tener un formato de fecha válido' },
  )
  @IsNotEmpty({ message: 'fecha_siembra es obligatoria' })
  fecha_siembra: string;

  // Valida que la edad sea un número no negativo.
  @IsNumber({}, { message: 'La edad debe ser un número' })
  @Min(0, { message: 'La edad no puede ser negativa' })
  @IsNotEmpty({ message: 'La edad es obligatoria' })
  edad: number;

  // Valida que la altura sea un número no negativo.
  @IsNumber({}, { message: 'La altura actual debe ser un número' })
  @Min(0, { message: 'La altura actual no puede ser negativa' })
  @IsNotEmpty({ message: 'La altura actual es obligatoria' })
  altura_actual: number;

  // Valida que el diámetro del tronco sea un número no negativo.
  @IsNumber({}, { message: 'El diámetro del tronco debe ser un número' })
  @Min(0, { message: 'El diámetro del tronco no puede ser negativo' })
  @IsNotEmpty({ message: 'El diámetro del tronco es obligatorio' })
  diametro_tronco: number;

  // Valida el estado de salud del árbol.
  @IsString({ message: 'El estado de salud debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El estado de salud es obligatorio' })
  estado_salud: string;

  // Valida que el nivel de felicidad esté entre 0 y 100.
  @IsNumber({}, { message: 'El nivel de felicidad debe ser un número' })
  @Min(0, { message: 'El nivel de felicidad no puede ser menor que 0' })
  @Max(100, { message: 'El nivel de felicidad no puede ser mayor que 100' })
  @IsNotEmpty({ message: 'El nivel de felicidad es obligatorio' })
  nivel_felicidad: number;

  // Valida que el nivel de agua esté entre 0 y 100.
  @IsNumber({}, { message: 'El nivel de agua debe ser un número' })
  @Min(0, { message: 'El nivel de agua no puede ser menor que 0' })
  @Max(100, { message: 'El nivel de agua no puede ser mayor que 100' })
  @IsNotEmpty({ message: 'El nivel de agua es obligatorio' })
  nivel_agua: number;

  // Valida que el nivel de nutrientes esté entre 0 y 100.
  @IsNumber({}, { message: 'El nivel de nutrientes debe ser un número' })
  @Min(0, { message: 'El nivel de nutrientes no puede ser menor que 0' })
  @Max(100, { message: 'El nivel de nutrientes no puede ser mayor que 100' })
  @IsNotEmpty({ message: 'El nivel de nutrientes es obligatorio' })
  nivel_nutrientes: number;

  // Permite registrar una descripción opcional.
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  // Valida que la latitud esté dentro del rango geográfico permitido.
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe ser mayor o igual a -90' })
  @Max(90, { message: 'La latitud debe ser menor o igual a 90' })
  @IsNotEmpty({ message: 'La latitud es obligatoria' })
  latitud: number;

  // Valida que la longitud esté dentro del rango geográfico permitido.
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe ser mayor o igual a -180' })
  @Max(180, { message: 'La longitud debe ser menor o igual a 180' })
  @IsNotEmpty({ message: 'La longitud es obligatoria' })
  longitud: number;
}
