import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

// Recibe únicamente el motivo; usuario, objetivo y fecha los determina el servidor.
export class CreateReporteDto {
  // Exige un motivo legible y limita su longitud para mantener datos moderables.
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  @ApiProperty({
    example: 'El contenido incluye información engañosa.',
    minLength: 3,
    maxLength: 1000,
  })
  motivo: string;
}
