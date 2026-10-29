// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad Arbol utilizada para validar la relación.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa el controlador del módulo de historiales.
import { HistorialController } from './historial.controller';

// Importa el servicio del módulo de historiales.
import { HistorialService } from './historial.service';

// Importa la entidad principal de historiales.
import { Historial } from './entities/historial.entity';

// Declara la configuración y dependencias del módulo de historiales.
@Module({
  // Registra los repositorios que serán inyectados en el servicio.
  imports: [TypeOrmModule.forFeature([Historial, Arbol])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [HistorialController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [HistorialService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [HistorialService],
})
export class HistorialModule {}
