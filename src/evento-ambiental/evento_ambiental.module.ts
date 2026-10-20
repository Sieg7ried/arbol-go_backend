// evento-ambiental.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventoAmbientalController } from './evento_ambiental.controller';
import { EventoAmbientalService } from './evento_ambiental.service';
import { EventoAmbiental } from './entities/evento-ambiental.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventoAmbiental])],
  controllers: [EventoAmbientalController],
  providers: [EventoAmbientalService],
  exports: [EventoAmbientalService], // lo necesitará Participación
})
export class EventoAmbientalModule {}