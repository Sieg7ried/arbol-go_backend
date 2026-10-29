// Importa el decorador para declarar un módulo de NestJS.
import { Module } from '@nestjs/common';

// Importa la integración de TypeORM con NestJS.
import { TypeOrmModule } from '@nestjs/typeorm';

// Importa la entidad Arbol utilizada para validar la relación.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa el controlador del módulo de cuidados.
import { CuidadoController } from './cuidado.controller';

// Importa el servicio del módulo de cuidados.
import { CuidadoService } from './cuidado.service';

// Importa la entidad principal de cuidados.
import { Cuidado } from './entities/cuidado.entity';

// Declara la configuración y dependencias del módulo de cuidados.
@Module({
  // Registra los repositorios que serán inyectados en el servicio.
  imports: [TypeOrmModule.forFeature([Cuidado, Arbol])],

  // Registra el controlador que expone los endpoints HTTP.
  controllers: [CuidadoController],

  // Registra el servicio que contiene la lógica de negocio.
  providers: [CuidadoService],

  // Exporta el servicio para que otros módulos puedan utilizarlo.
  exports: [CuidadoService],
})
export class CuidadoModule {}
