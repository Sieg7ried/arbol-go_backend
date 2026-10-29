// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateRecordatorioDto } from './create-recordatorio.dto';

// Define los datos opcionales permitidos para actualizar un recordatorio.
export class UpdateRecordatorioDto extends PartialType(
  CreateRecordatorioDto,
) {}
