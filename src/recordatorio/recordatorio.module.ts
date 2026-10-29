// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad Arbol utilizada para validar la relación.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa el controlador del módulo de recordatorios.
import { RecordatorioController } from './recordatorio.controller';

// Importa el servicio del módulo de recordatorios.
import { RecordatorioService } from './recordatorio.service';

// Importa la entidad principal de recordatorios.
import { Recordatorio } from './entities/recordatorio.entity';

// Declara la configuración y dependencias del módulo de recordatorios.
@Module({
  // Registra los repositorios que serán inyectados en el servicio.
  imports: [TypeOrmModule.forFeature([Recordatorio, Arbol])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [RecordatorioController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [RecordatorioService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [RecordatorioService],
})
export class RecordatorioModule {}
