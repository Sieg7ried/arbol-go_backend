import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsIn, IsOptional } from 'class-validator';
import { CreateEspecieDto } from './create-especie.dto';

// PartialType hace que todas las propiedades de CreateEspecieDto sean opcionales
export class UpdateEspecieDto extends PartialType(CreateEspecieDto) {
  // Campo opcional para actualizar el estado activo
  @IsBoolean({ message: 'isActive debe ser un valor booleano' })
  @IsOptional()
  isActive?: boolean;

  // Campo opcional para actualizar el rol (solo valores permitidos)
  @IsIn(['user', 'admin'], { message: 'El rol debe ser "user" o "admin"' })
  @IsOptional()
  role?: string;
}