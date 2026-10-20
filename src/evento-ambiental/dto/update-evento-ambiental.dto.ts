// dto/update-evento-ambiental.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateEventoAmbientalDto } from './create-evento-ambiental.dto';

// Todas las propiedades pasan a ser opcionales
export class UpdateEventoAmbientalDto extends PartialType(
  CreateEventoAmbientalDto,
) {}