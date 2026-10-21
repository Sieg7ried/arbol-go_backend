import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogroController } from './logro.controller';
import { LogroService } from './logro.service';
import { Logro } from './entities/logro.entity';

@Module({
  // Registra la entidad Logro para poder inyectar su repositorio
  imports: [TypeOrmModule.forFeature([Logro])],
  controllers: [LogroController],
  providers: [LogroService],
  // Se exporta para usarlo después en el módulo de Usuario_Logro
  exports: [LogroService],
})
export class LogroModule {}
