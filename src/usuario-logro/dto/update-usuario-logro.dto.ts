// Importa PartialType para convertir todas las propiedades en opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa el DTO que contiene las reglas de validación de creación.
import { CreateUsuarioLogroDto } from './create-usuario-logro.dto';

// Define los datos opcionales permitidos para actualizar un registro.
export class UpdateUsuarioLogroDto extends PartialType(
  CreateUsuarioLogroDto,
) {}
