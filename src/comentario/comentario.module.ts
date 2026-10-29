// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad User utilizada para validar la relación.
import { User } from '../user/entities/user.entity';

// Importa la entidad Publicacion utilizada para validar la relación.
import { Publicacion } from '../publicacion/entities/publicacion.entity';

// Importa el controlador del módulo de comentarios.
import { ComentarioController } from './comentario.controller';

// Importa el servicio del módulo de comentarios.
import { ComentarioService } from './comentario.service';

// Importa la entidad principal de comentarios.
import { Comentario } from './entities/comentario.entity';

// Declara la configuración y dependencias del módulo de comentarios.
@Module({
  // Registra los repositorios necesarios para el servicio.
  imports: [TypeOrmModule.forFeature([Comentario, User, Publicacion])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [ComentarioController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [ComentarioService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [ComentarioService],
})
export class ComentarioModule {}
