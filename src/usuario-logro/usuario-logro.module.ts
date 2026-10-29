// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad User relacionada con la tabla intermedia.
import { User } from '../user/entities/user.entity';

// Importa la entidad Logro relacionada con la tabla intermedia.
import { Logro } from '../logro/entities/logro.entity';

// Importa el controlador del módulo usuario-logro.
import { UsuarioLogroController } from './usuario-logro.controller';

// Importa el servicio del módulo usuario-logro.
import { UsuarioLogroService } from './usuario-logro.service';

// Importa la entidad principal de la tabla intermedia.
import { UsuarioLogro } from './entities/usuario-logro.entity';

// Declara la configuración y dependencias del módulo usuario-logro.
@Module({
  // Registra los repositorios necesarios para las tres entidades.
  imports: [TypeOrmModule.forFeature([UsuarioLogro, User, Logro])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [UsuarioLogroController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [UsuarioLogroService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [UsuarioLogroService],
})
export class UsuarioLogroModule {}
