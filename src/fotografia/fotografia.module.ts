// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad Arbol utilizada para validar la relación.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa el controlador del módulo de fotografías.
import { FotografiaController } from './fotografia.controller';

// Importa el servicio del módulo de fotografías.
import { FotografiaService } from './fotografia.service';

// Importa la entidad principal de fotografías.
import { Fotografia } from './entities/fotografia.entity';

// Declara la configuración y dependencias del módulo de fotografías.
@Module({
  // Registra los repositorios que serán inyectados en el servicio.
  imports: [TypeOrmModule.forFeature([Fotografia, Arbol])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [FotografiaController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [FotografiaService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [FotografiaService],
})
export class FotografiaModule {}
