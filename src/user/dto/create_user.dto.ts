import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  // Validación de email con formato correcto
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @ApiProperty({ example: 'usuario@arbolgo.com' })
  email: string;

  // Exige al menos ocho caracteres y una combinación de letras y números.
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*\p{L})(?=.*\p{N}).+$/u, {
    message: 'La contraseña debe incluir al menos una letra y un número',
  })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @ApiProperty({ example: 'secreto123', minLength: 8, writeOnly: true })
  password: string;

  // Validación de nombre completo
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @ApiProperty({ example: 'Ana García' })
  fullName: string;

  // Permite registrar una foto de perfil opcional.
  @IsString({ message: 'La foto de perfil debe ser una cadena de texto' })
  @IsOptional()
  @ApiPropertyOptional({ example: 'https://example.com/perfil.jpg' })
  foto_perfil?: string;

  // Permite establecer opcionalmente el nivel inicial.
  @IsNumber({}, { message: 'El nivel debe ser un número' })
  @Min(1, { message: 'El nivel debe ser mayor o igual a 1' })
  @IsOptional()
  @ApiPropertyOptional({ example: 1 })
  nivel?: number;

  // Permite establecer opcionalmente la experiencia inicial.
  @IsNumber({}, { message: 'La experiencia debe ser un número' })
  @Min(0, { message: 'La experiencia no puede ser negativa' })
  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  experiencia?: number;

  // Permite establecer opcionalmente los puntos iniciales.
  @IsNumber({}, { message: 'Los puntos deben ser un número' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  @IsOptional()
  @ApiPropertyOptional({ example: 0 })
  puntos?: number;
}