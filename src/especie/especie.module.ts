import { Module } from '@nestjs/common';
import { EspecieController } from './especie.controller';
import { EspecieService } from './especie.service';

@Module({
  controllers: [EspecieController],
  providers: [EspecieService]
})
export class EspecieModule {}
