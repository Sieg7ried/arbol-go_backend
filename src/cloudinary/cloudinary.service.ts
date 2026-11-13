// Importa excepciones para rechazar archivos inválidos o errores externos.
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

// Importa la configuración centralizada de variables de entorno.
import { ConfigService } from '@nestjs/config';

// Importa el SDK oficial de Cloudinary.
import { v2 as cloudinary } from 'cloudinary';

// Importa los tipos usados por la respuesta del SDK y Multer.
import type { UploadApiResponse } from 'cloudinary';
import type { Express } from 'express';

// Encapsula la conexión y las operaciones de almacenamiento de imágenes.
@Injectable()
export class CloudinaryService {
  // Inicializa el cliente usando exclusivamente credenciales validadas del entorno.
  constructor(private readonly configService: ConfigService) {
    // Lee y valida el nombre de la cuenta antes de configurar el SDK.
    const cloudName = this.getRequiredConfig('CLOUDINARY_NAME');

    // Lee y valida la clave pública necesaria para autenticar las subidas.
    const apiKey = this.getRequiredConfig('CLOUDINARY_API_KEY');

    // Lee y valida el secreto privado usado por Cloudinary.
    const apiSecret = this.getRequiredConfig('CLOUDINARY_API_SECRET');

    // Configura el SDK una sola vez cuando NestJS crea el servicio.
    cloudinary.config({
      // Indica la cuenta de Cloudinary donde se almacenarán las imágenes.
      cloud_name: cloudName,

      // Define la clave pública de autenticación del SDK.
      api_key: apiKey,

      // Define el secreto privado de autenticación del SDK.
      api_secret: apiSecret,

      // Fuerza el uso de URLs HTTPS para las imágenes almacenadas.
      secure: true,
    });
  }

  // Lee una variable requerida y detiene el arranque si falta o está vacía.
  private getRequiredConfig(key: string): string {
    // Obtiene el valor desde ConfigService, que carga el archivo .env globalmente.
    const value = this.configService.get<string>(key);

    // Evita inicializar Cloudinary con credenciales inexistentes o espacios.
    if (!value || value.trim().length === 0) {
      // Explica exactamente qué variable debe configurarse para corregir el arranque.
      throw new Error(
        `Falta la variable de entorno ${key}. ` +
          'Añádela al archivo .env antes de iniciar el backend.',
      );
    }

    // Elimina espacios accidentales alrededor de la credencial.
    return value.trim();
  }

  // Sube un buffer de Multer y devuelve solamente la URL pública HTTPS.
  async uploadImage(
    file: Express.Multer.File,
    folder = 'arbol-go/fotografias',
  ): Promise<Pick<UploadApiResponse, 'secure_url' | 'public_id'>> {
    // Rechaza requests sin archivo o con buffer vacío.
    if (!file?.buffer || file.buffer.length === 0) {
      throw new BadRequestException('La imagen es obligatoria');
    }

    // Convierte el callback del SDK en una promesa controlable con await.
    const uploadResult = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        // Crea un stream para enviar el buffer sin escribir archivos temporales.
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            overwrite: false,
          },
          // Procesa la respuesta confirmada por Cloudinary.
          (error, result) => {
            // Propaga errores para impedir guardar una URL inexistente.
            if (error) {
              reject(error);
              return;
            }

            // Rechaza respuestas incompletas del proveedor externo.
            if (!result?.secure_url || !result.public_id) {
              reject(
                new Error('Cloudinary no devolvió secure_url y public_id'),
              );
              return;
            }

            // Resuelve solo cuando existe una URL segura válida.
            resolve(result);
          },
        );

        // Envía el buffer al proveedor y finaliza el stream.
        uploadStream.end(file.buffer);
      },
    ).catch((error: unknown) => {
      // Expone un error explícito sin guardar datos inconsistentes.
      throw new InternalServerErrorException(
        'No fue posible almacenar la imagen en Cloudinary',
        { cause: error },
      );
    });

    // Extrae y devuelve ambos datos confirmados por Cloudinary para persistirlos.
    return {
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };
  }

  // Elimina un recurso remoto usando el public_id almacenado en la base de datos.
  async deleteImage(publicId: string): Promise<void> {
    if (!publicId?.trim()) {
      throw new BadRequestException('El public_id de Cloudinary es obligatorio');
    }

    let deletionResult: { result?: string };

    try {
      // Paso 1: llama al SDK con el public_id persistido y el tipo de recurso correcto.
      deletionResult = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      });
    } catch (error: unknown) {
      throw new InternalServerErrorException(
        'No fue posible eliminar la imagen de Cloudinary',
        { cause: error },
      );
    }

    // Paso 2: "not found" ya está limpio; cualquier otro resultado inesperado se informa.
    if (
      deletionResult.result !== 'ok' &&
      deletionResult.result !== 'not found'
    ) {
      throw new InternalServerErrorException(
        'Cloudinary no confirmó la eliminación de la imagen',
      );
    }
  }
}
