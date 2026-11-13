import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const nodeEnv = process.env.NODE_ENV;

  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  const allowedOrigins =
    configuredOrigins.length > 0
      ? configuredOrigins
      : nodeEnv === 'production'
        ? []
        : ['http://localhost:3000', 'http://localhost:5173'];

  if (allowedOrigins.includes('*')) {
    throw new Error('CORS_ORIGINS no puede contener el wildcard "*".');
  }

  if (nodeEnv === 'production' && allowedOrigins.length === 0) {
    throw new Error(
      'En producción debe configurarse CORS_ORIGINS con los orígenes permitidos.',
    );
  }

  // Helmet añade cabeceras HTTP de seguridad; en desarrollo se desactiva CSP para que Swagger UI funcione.
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
    }),
  );

  // CORS permite únicamente los orígenes explícitos; producción requiere CORS_ORIGINS y nunca acepta "*".
  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Solo crea y expone la documentación OpenAPI fuera de producción.
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API ÁRBOL GO')
      .setDescription(
        'API REST para gestión de árboles, cuidados, crecimiento, fotografías, recordatorios, publicaciones y gamificación.',
      )
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        'access-token',
      )
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, swaggerDocument);
  }

  // Valida y transforma todos los cuerpos; rechaza propiedades no declaradas en cada DTO.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Aplica las reglas de serialización (por ejemplo, @Exclude()) a las respuestas HTTP.
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const port: number = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
}
void bootstrap();