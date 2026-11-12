import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Arbol } from '../arbol/entities/arbol.entity';
import { User } from '../user/entities/user.entity';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';

// Registra el endpoint de tokens y expone el servicio push para los cronjobs.
@Module({
  imports: [TypeOrmModule.forFeature([User, Arbol])],
  controllers: [NotificacionesController],
  providers: [NotificacionesService],
  exports: [NotificacionesService],
})
export class NotificacionesModule {}
