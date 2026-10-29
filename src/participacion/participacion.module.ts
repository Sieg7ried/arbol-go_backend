// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad User relacionada con la tabla intermedia.
import { User } from '../user/entities/user.entity';

// Importa la entidad EventoAmbiental relacionada con la tabla intermedia.
import { EventoAmbiental } from '../evento-ambiental/entities/evento-ambiental.entity';

// Importa el controlador del módulo de participaciones.
import { ParticipacionController } from './participacion.controller';

// Importa el servicio del módulo de participaciones.
import { ParticipacionService } from './participacion.service';

// Importa la entidad principal de la tabla intermedia.
import { Participacion } from './entities/participacion.entity';

// Declara la configuración y dependencias del módulo de participaciones.
@Module({
  // Registra los repositorios necesarios para las tres entidades.
  imports: [
    TypeOrmModule.forFeature([Participacion, User, EventoAmbiental]),
  ],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [ParticipacionController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [ParticipacionService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [ParticipacionService],
})
export class ParticipacionModule {}
