// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateComentarioDto } from './create-comentario.dto';

// Define los datos opcionales permitidos para actualizar un comentario.
export class UpdateComentarioDto extends PartialType(CreateComentarioDto) {}
