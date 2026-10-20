import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EspecieService } from './especie.service';
import { EspecieController } from './especie.controller';
import { Especie } from './entities/especie.entity';

@Module({
  // Importar el repositorio de User
  imports: [TypeOrmModule.forFeature([Especie])],
  controllers: [EspecieController],
  providers: [EspecieService],
  // Exportar el servicio para usarlo en otros módulos (como Auth)
  exports: [EspecieService],
})
export class EspecieModule {}