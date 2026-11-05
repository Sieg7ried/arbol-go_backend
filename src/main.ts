import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Define la información pública y el esquema JWT del contrato OpenAPI.
  const swaggerConfig = new DocumentBuilder()
    // Identifica la API principal de la plataforma.
    .setTitle('API ÁRBOL GO')
    // Describe los módulos funcionales expuestos por el backend.
    .setDescription(
      'API REST para gestión de árboles, cuidados, crecimiento, fotografías, recordatorios, publicaciones y gamificación.',
    )
    // Establece la versión visible del contrato HTTP.
    .setVersion('1.0')
    // Permite probar endpoints protegidos con un token Bearer.
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'access-token',
    )
    // Finaliza la configuración del documento OpenAPI.
    .build();

  // Genera el documento usando los controladores y DTOs registrados.
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  // Expone Swagger UI en la ruta /api.
  SwaggerModule.setup('api', app, swaggerDocument);

  // Configurar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
      transform: true, // Transforma los datos al tipo definido en el DTO
    }),
  );

  // Aplicar @Exclude() de class-transformer en todas las respuestas
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Habilitar CORS (opcional, para desarrollo con frontend)
  app.enableCors();

  const port: number = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}
void bootstrap();