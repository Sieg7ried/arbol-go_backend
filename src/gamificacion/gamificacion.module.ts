// Importa el decorador para declarar un módulo NestJS.
import { Module } from '@nestjs/common';

// Importa el registro de repositorios de TypeORM.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa las entidades utilizadas por la lógica de gamificación.
import { Cuidado } from '../cuidado/entities/cuidado.entity';
import { Logro } from '../logro/entities/logro.entity';
import { User } from '../user/entities/user.entity';
import { UsuarioLogro } from '../usuario-logro/entities/usuario-logro.entity';

// Importa el servicio central de gamificación.
import { GamificacionService } from './gamificacion.service';

// Encapsula las dependencias de recompensas, niveles y logros automáticos.
@Module({
  // Registra todos los repositorios requeridos por el servicio.
  imports: [
    TypeOrmModule.forFeature([Cuidado, User, Logro, UsuarioLogro]),
  ],

  // Registra el servicio que contiene las reglas de negocio.
  providers: [GamificacionService],

  // Permite que CuidadoModule invoque el procesamiento automático.
  exports: [GamificacionService],
})
export class GamificacionModule {}
