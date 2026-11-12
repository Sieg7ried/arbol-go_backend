import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';
import { CreateUserDto } from './create_user.dto';

// Convierte los campos de CreateUserDto en opcionales conservando sus validaciones.
export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Solo acepta un booleano para impedir valores ambiguos al cambiar el estado.
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;

  // Valida el rol contra el enum canónico, que incluye user, admin y coordinator.
  @IsEnum(Role, { message: 'El rol debe ser user, admin o coordinator' })
  @IsOptional()
  role?: Role;
}
