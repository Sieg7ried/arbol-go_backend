// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad Especie utilizada por el servicio.
import { Especie } from '../especie/entities/especie.entity';

// Importa la entidad User utilizada por el servicio.
import { User } from '../user/entities/user.entity';

// Importa el controlador del módulo de árboles.
import { ArbolController } from './arbol.controller';

// Importa el servicio del módulo de árboles.
import { ArbolService } from './arbol.service';

// Importa la entidad principal de árboles.
import { Arbol } from './entities/arbol.entity';

// Declara la configuración y dependencias del módulo de árboles.
@Module({
  // Registra los repositorios que serán inyectados en el servicio.
  imports: [TypeOrmModule.forFeature([Arbol, User, Especie])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [ArbolController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [ArbolService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [ArbolService],
})
export class ArbolModule {}
