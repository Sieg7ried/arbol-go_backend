// Importa la función que registra metadatos en cada endpoint protegido.
import { SetMetadata } from '@nestjs/common';

// Define los recursos cuya propiedad puede verificarse en el guard.
export type OwnershipResource =
  | 'arbol'
  | 'cuidado'
  | 'fotografia'
  | 'recordatorio'
  | 'publicacion'
  | 'comentario';

// Define la clave compartida entre el decorador y OwnershipGuard.
export const OWNERSHIP_RESOURCE_KEY = 'ownership_resource';

// Declara qué entidad debe consultar OwnershipGuard antes de permitir la operación.
export const OwnsResource = (resource: OwnershipResource) =>
  SetMetadata(OWNERSHIP_RESOURCE_KEY, resource);
