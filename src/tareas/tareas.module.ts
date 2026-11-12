// Importa el decorador para declarar el módulo de tareas.
import { Module } from '@nestjs/common';

// Importa la integración de repositorios TypeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa las entidades filtradas y actualizadas directamente por el cronjob.
import { Cuidado } from '../cuidado/entities/cuidado.entity';
import { Recordatorio } from '../recordatorio/entities/recordatorio.entity';

// Importa el módulo que exporta el servicio de push Firebase.
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

// Importa el servicio que contiene las tareas programadas.
import { TareasService } from './tareas.service';

// Agrupa la configuración de los cronjobs de la aplicación.
@Module({
  // Registra repositorios y dependencias del servicio de tareas.
  imports: [
    TypeOrmModule.forFeature([Cuidado, Recordatorio]),
    NotificacionesModule,
  ],

  // Registra el cronjob para que NestJS lo ejecute automáticamente.
  providers: [TareasService],
})
export class TareasModule {}
