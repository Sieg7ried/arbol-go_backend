// Importa el decorador para declarar un módulo NestJS.
import { Module } from '@nestjs/common';

// Importa el servicio que encapsula la integración con Cloudinary.
import { CloudinaryService } from './cloudinary.service';

// Agrupa la configuración reutilizable del almacenamiento de imágenes.
@Module({
  // Registra el servicio de subida de archivos.
  providers: [CloudinaryService],

  // Permite que otros módulos utilicen CloudinaryService.
  exports: [CloudinaryService],
})
export class CloudinaryModule {}
