// Importa el decorador para declarar el módulo de tareas.
import { Module } from '@nestjs/common';

// Importa la integración de repositorios TypeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa las entidades consultadas por el cronjob.
import { Arbol } from '../arbol/entities/arbol.entity';
import { Cuidado } from '../cuidado/entities/cuidado.entity';

// Importa el módulo que exporta RecordatorioService.
import { RecordatorioModule } from '../recordatorio/recordatorio.module';

// Importa el servicio que contiene las tareas programadas.
import { TareasService } from './tareas.service';

// Agrupa la configuración de los cronjobs de la aplicación.
@Module({
  // Registra repositorios y dependencias del servicio de tareas.
  imports: [
    TypeOrmModule.forFeature([Cuidado, Arbol]),
    RecordatorioModule,
  ],

  // Registra el cronjob para que NestJS lo ejecute automáticamente.
  providers: [TareasService],
})
export class TareasModule {}
