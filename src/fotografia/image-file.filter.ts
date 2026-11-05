// Importa la excepción usada para rechazar formatos no permitidos.
import { BadRequestException } from '@nestjs/common';

// Importa el tipo de request de Express para el interceptor de Multer.
import type { Request } from 'express';

// Valida que el archivo recibido sea una imagen compatible con Cloudinary.
export function imageFileFilter(
  _request: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  // Define los formatos permitidos por el módulo de fotografías.
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  // Rechaza formatos potencialmente peligrosos o no soportados.
  if (!allowedTypes.includes(file.mimetype)) {
    callback(
      new BadRequestException(
        'Solo se permiten imágenes JPEG, PNG o WebP',
      ),
      false,
    );
    return;
  }

  // Permite que Multer entregue el buffer al controlador.
  callback(null, true);
}
