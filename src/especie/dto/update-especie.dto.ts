import { PartialType } from '@nestjs/mapped-types';
import { CreateEspecieDto } from './create-especie.dto';

/**
 * Define los campos de especie que se pueden actualizar.
 * PartialType conserva los validadores de creación y hace opcionales sus propiedades.
 * Los campos de usuario como role o isActive no se aceptan en este DTO.
 */
export class UpdateEspecieDto extends PartialType(CreateEspecieDto) {}
