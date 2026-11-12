// Importa PartialType para reutilizar las reglas de validación con campos opcionales.
import { PartialType } from '@nestjs/mapped-types';

// Importa los datos validados que utilizan los servicios internos de asignación.
import { CreateUsuarioLogroDto } from './create-usuario-logro.dto';

/**
 * Define cambios parciales usados por servicios internos para actualizar una relación.
 * No existe una ruta HTTP de actualización en UsuarioLogroController.
 */
export class UpdateUsuarioLogroDto extends PartialType(CreateUsuarioLogroDto) {}
