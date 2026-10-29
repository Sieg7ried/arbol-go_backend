import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  // Validación de email con formato correcto
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  // Validación de contraseña con mínimo 6 caracteres
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  // Validación de nombre completo
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  fullName: string;

  // Permite registrar una foto de perfil opcional.
  @IsString({ message: 'La foto de perfil debe ser una cadena de texto' })
  @IsOptional()
  foto_perfil?: string;

  // Permite establecer opcionalmente el nivel inicial.
  @IsNumber({}, { message: 'El nivel debe ser un número' })
  @Min(1, { message: 'El nivel debe ser mayor o igual a 1' })
  @IsOptional()
  nivel?: number;

  // Permite establecer opcionalmente la experiencia inicial.
  @IsNumber({}, { message: 'La experiencia debe ser un número' })
  @Min(0, { message: 'La experiencia no puede ser negativa' })
  @IsOptional()
  experiencia?: number;

  // Permite establecer opcionalmente los puntos iniciales.
  @IsNumber({}, { message: 'Los puntos deben ser un número' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  @IsOptional()
  puntos?: number;
}