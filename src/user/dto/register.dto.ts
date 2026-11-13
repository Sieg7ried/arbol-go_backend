// Importa validadores para comprobar los datos recibidos al registrar.
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MinLength,
} from 'class-validator';
// Importa decoradores para documentar el DTO en Swagger.
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Datos permitidos para registrar un usuario.
 * No hereda otros campos, por lo que nivel, experiencia y puntos no forman parte del DTO.
 */
export class RegisterDto {
  // Exige que email tenga formato de correo electrónico.
  @IsEmail({}, { message: 'El email debe ser válido' })
  // Exige que email no esté vacío.
  @IsNotEmpty({ message: 'El email es obligatorio' })
  // Publica email como campo requerido en Swagger.
  @ApiProperty({ example: 'usuario@arbolgo.com' })
  email: string;

  // Exige que password sea una cadena de texto.
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  // Exige al menos ocho caracteres y una combinación de letras y números.
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*\p{L})(?=.*\p{N}).+$/u, {
    message: 'La contraseña debe incluir al menos una letra y un número',
  })
  // Exige que password no esté vacío.
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  // Documenta la contraseña como requerida y de solo escritura en Swagger.
  @ApiProperty({ example: 'secreto123', minLength: 8, writeOnly: true })
  password: string;

  // Exige que fullName sea una cadena de texto.
  @IsString({ message: 'El nombre completo debe ser una cadena de texto' })
  // Exige que fullName no esté vacío.
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  // Publica fullName como campo requerido en Swagger.
  @ApiProperty({ example: 'Ana García' })
  fullName: string;

  // Si se proporciona, exige que foto_perfil sea una URL válida.
  @IsUrl({}, { message: 'La foto de perfil debe ser una URL válida' })
  // Permite omitir foto_perfil durante el registro.
  @IsOptional()
  // Documenta foto_perfil como campo opcional en Swagger.
  @ApiPropertyOptional({ example: 'https://example.com/perfil.jpg' })
  foto_perfil?: string;
}
