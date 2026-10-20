// dto/create-evento-ambiental.dto.ts
import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventoAmbientalDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  descripcion?: string;

  @Type(() => Date)
  @IsDate({ message: 'La fecha debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  fecha: Date;

  @IsString({ message: 'El lugar debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El lugar es obligatorio' })
  lugar: string;

  @IsString({ message: 'El organizador debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El organizador es obligatorio' })
  organizador: string;
}

