import { IsNumber, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateEspecieDto {
  // Validación de nombre común con formato correcto
  @IsString({ message: 'El nombre común debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre común es obligatorio' })
  nombreComun: string;

  // Validación del nombre científico con formato correcto
  @IsString({ message: 'El nombre científico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre científico es obligatorio' })
  nombreCientifico: string;

  // Validación de frecuencia riego con formato correcto
  @IsNumber({}, { message: 'La frecuencia de riego debe ser un número' })
  @IsNotEmpty({ message: 'La frecuencia de riego es obligatoria' })
  frecuenciaRiego: number; 

  // Validación de frecuencia de poda con formato correcto
  @IsNumber({}, { message: 'La frecuencia de poda debe ser un número' })
  @IsNotEmpty({ message: 'La frecuencia de poda es obligatoria' })
  frecuenciaPoda: number;

  // Validación de frecuencia de abono con formato correcto
  @IsNumber({}, { message: 'La frecuencia de abono debe ser un número' })
  @IsNotEmpty({ message: 'La frecuencia de abono es obligatoria' })
  frecuenciaAbono: number;

  // Validación de descripcion con formato correcto
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción no es obligatoria' })
  descripcion: string;
 
}