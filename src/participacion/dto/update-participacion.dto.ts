// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateParticipacionDto } from './create-participacion.dto';

// Define los datos opcionales permitidos para actualizar una participación.
export class UpdateParticipacionDto extends PartialType(
  CreateParticipacionDto,
) {}
