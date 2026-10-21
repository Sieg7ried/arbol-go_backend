import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateLogroDto {
  // Validación del nombre del logro
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  // Validación de la descripción
  @IsString({ message: 'La descripcion debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  descripcion: string;

  // Validación de los puntos otorgados
  @IsInt({ message: 'Los puntos otorgados deben ser un número entero' })
  @Min(0, { message: 'Los puntos otorgados no pueden ser negativos' })
  puntos_otorgados: number;

  // Validación de la imagen
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La imagen es obligatoria' })
  imagen: string;
}
