// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreatePublicacionDto } from './create-publicacion.dto';

// Define los datos opcionales permitidos para actualizar una publicación.
export class UpdatePublicacionDto extends PartialType(CreatePublicacionDto) {}
