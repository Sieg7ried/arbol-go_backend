// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateCuidadoDto } from './create-cuidado.dto';

// Define los datos opcionales permitidos para actualizar un cuidado.
export class UpdateCuidadoDto extends PartialType(CreateCuidadoDto) {}
