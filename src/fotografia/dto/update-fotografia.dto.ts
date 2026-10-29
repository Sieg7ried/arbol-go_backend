// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateFotografiaDto } from './create-fotografia.dto';

// Define los datos opcionales permitidos para actualizar una fotografía.
export class UpdateFotografiaDto extends PartialType(CreateFotografiaDto) {}
