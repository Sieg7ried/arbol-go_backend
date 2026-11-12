import { IsString, MaxLength, MinLength } from 'class-validator';

// Valida un token FCM recibido del cliente sin aceptar campos adicionales en el body.
export class RegistrarTokenDto {
  // El mínimo rechaza valores vacíos o claramente truncados; el máximo respeta la columna.
  @IsString()
  @MinLength(20)
  @MaxLength(512)
  fcmToken: string;
}
