import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

/**
 * Define los campos permitidos para crear una especie.
 * La autorización administrativa se aplica en el controlador; estas reglas validan los datos.
 */
export class CreateEspecieDto {
  /** Nombre común presentado en el catálogo. */
  // Rechaza valores que no sean texto para evitar tipos inesperados en el nombre.
  @IsString({ message: 'El nombre común debe ser una cadena de texto' })
  // Rechaza una cadena vacía para que cada especie tenga nombre.
  @IsNotEmpty({ message: 'El nombre común es obligatorio' })
  nombreComun: string;

  /** Nombre científico usado para identificar la especie. */
  // Rechaza valores que no sean texto para conservar el formato del nombre científico.
  @IsString({ message: 'El nombre científico debe ser una cadena de texto' })
  // Exige que el nombre científico no esté vacío.
  @IsNotEmpty({ message: 'El nombre científico es obligatorio' })
  nombreCientifico: string;

  /** Frecuencia de riego expresada como número. */
  // Rechaza texto y objetos para limitar el dato a un valor numérico.
  @IsNumber({}, { message: 'La frecuencia de riego debe ser un número' })
  // Exige que el campo requerido esté presente.
  @IsNotEmpty({ message: 'La frecuencia de riego es obligatoria' })
  frecuenciaRiego: number;

  /** Frecuencia de poda expresada como número. */
  // Rechaza valores que no sean números para evitar datos incompatibles.
  @IsNumber({}, { message: 'La frecuencia de poda debe ser un número' })
  // Exige que el campo requerido esté presente.
  @IsNotEmpty({ message: 'La frecuencia de poda es obligatoria' })
  frecuenciaPoda: number;

  /** Frecuencia de abono expresada como número. */
  // Rechaza valores que no sean números para evitar datos incompatibles.
  @IsNumber({}, { message: 'La frecuencia de abono debe ser un número' })
  // Exige que el campo requerido esté presente.
  @IsNotEmpty({ message: 'La frecuencia de abono es obligatoria' })
  frecuenciaAbono: number;

  /** Descripción de la especie, actualmente requerida por el contrato de creación. */
  // Rechaza valores que no sean texto para evitar tipos inesperados en la descripción.
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  // Mantiene el campo requerido y rechaza una descripción vacía.
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  descripcion: string;
}
