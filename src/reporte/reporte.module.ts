// Importa el decorador para declarar el módulo NestJS.
import { Module } from '@nestjs/common';

// Registra en TypeORM las entidades usadas por el servicio transaccional.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa las entidades relacionadas con los reportes.
import { User } from '../user/entities/user.entity';
import { Publicacion } from '../publicacion/entities/publicacion.entity';
import { Comentario } from '../comentario/entities/comentario.entity';
import { Reporte } from './entities/reporte.entity';

// Importa el controlador y el servicio del módulo de reportes.
import { ReporteController } from './reporte.controller';
import { ReporteService } from './reporte.service';

// Agrupa rutas, repositorios y lógica de moderación compartida.
@Module({
  imports: [
    // Proporciona repositorios para las transacciones de reporte y sus relaciones.
    TypeOrmModule.forFeature([Reporte, User, Publicacion, Comentario]),
  ],
  controllers: [ReporteController],
  providers: [ReporteService],
  exports: [ReporteService],
})
export class ReporteModule {}
