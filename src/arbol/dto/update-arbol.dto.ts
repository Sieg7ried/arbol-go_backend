// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateArbolDto } from './create-arbol.dto';

// Define los datos opcionales permitidos para actualizar un árbol.
export class UpdateArbolDto extends PartialType(CreateArbolDto) {}
