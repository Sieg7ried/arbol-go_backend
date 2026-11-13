// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateCuidadoDto } from './create-cuidado.dto';

// PartialType conserva los validadores @IsEnum de tipo_cuidado y estado,
// aplicándolos cuando esos campos se incluyen en una actualización.
export class UpdateCuidadoDto extends PartialType(CreateCuidadoDto) {}
