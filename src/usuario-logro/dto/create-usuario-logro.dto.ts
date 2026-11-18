// Importa validadores para comprobar datos de asignaciones creadas desde servicios internos.
import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Datos usados internamente por los servicios para registrar un logro obtenido.
 * El controlador HTTP no expone una ruta POST que permita a clientes crear asignaciones.
 * La fecha se excluye para que la asignación reciba su marca temporal al persistirse.
 */
export class CreateUsuarioLogroDto {
  /** Identificador del usuario al que el backend asigna el logro. */
  // Exige un número para impedir identificadores con tipos inesperados.
  @IsNumber({}, { message: 'id_usuario debe ser un número' })
  // Exige que el servicio interno proporcione el usuario destino.
  @IsNotEmpty({ message: 'id_usuario es obligatorio' })
  @ApiProperty({ example: 1 })
  id_usuario: number;

  /** Identificador del logro del catálogo que el backend asigna. */
  // Exige un número para impedir identificadores con tipos inesperados.
  @IsNumber({}, { message: 'id_logro debe ser un número' })
  // Exige que el servicio interno proporcione un logro destino.
  @IsNotEmpty({ message: 'id_logro es obligatorio' })
  @ApiProperty({ example: 1 })
  id_logro: number;
}
