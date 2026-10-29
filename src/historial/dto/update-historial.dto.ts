// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateHistorialDto } from './create-historial.dto';

// Define los datos opcionales permitidos para actualizar un historial.
export class UpdateHistorialDto extends PartialType(CreateHistorialDto) {}
