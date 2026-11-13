// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateArbolDto } from './create-arbol.dto';

// PartialType conserva @IsEnum de CreateArbolDto y vuelve el campo opcional
// sin perder la restricción del catálogo de estados de salud.
export class UpdateArbolDto extends PartialType(CreateArbolDto) {}
