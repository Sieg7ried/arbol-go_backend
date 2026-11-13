// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateRecordatorioDto } from './create-recordatorio.dto';

// PartialType conserva los validadores @IsEnum de repeticion y estado,
// aplicándolos cuando esos campos se incluyen en una actualización.
export class UpdateRecordatorioDto extends PartialType(
  CreateRecordatorioDto,
) {}
