// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad User utilizada para validar la relación.
import { User } from '../user/entities/user.entity';

// Importa el controlador del módulo de publicaciones.
import { PublicacionController } from './publicacion.controller';

// Importa el servicio del módulo de publicaciones.
import { PublicacionService } from './publicacion.service';

// Importa la entidad principal de publicaciones.
import { Publicacion } from './entities/publicacion.entity';

// Declara la configuración y dependencias del módulo de publicaciones.
@Module({
  // Registra los repositorios que serán inyectados en el servicio.
  imports: [TypeOrmModule.forFeature([Publicacion, User])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [PublicacionController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [PublicacionService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [PublicacionService],
})
export class PublicacionModule {}
