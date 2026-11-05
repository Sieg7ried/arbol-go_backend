import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';

// Clave compartida entre el decorador y el guard (evita errores de escritura)
export const ROLES_KEY = 'roles';

/**
 * Decorador para especificar roles requeridos
 * Uso: @Roles('admin', 'moderator')
 */
export const Roles = (...roles: Array<Role | string>): CustomDecorator<string> =>
  SetMetadata(ROLES_KEY, roles);