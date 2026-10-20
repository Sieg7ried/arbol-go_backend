// evento-ambiental.controller.ts
import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  ParseIntPipe, HttpCode, HttpStatus, UseGuards,
} from '@nestjs/common';
import { EventoAmbientalService } from './evento_ambiental.service';
import { CreateEventoAmbientalDto } from './dto/create-evento-ambiental.dto';
import { UpdateEventoAmbientalDto } from './dto/update-evento-ambiental.dto';
import { EventoAmbiental } from './entities/evento-ambiental.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('evento-ambiental')
@UseGuards(JwtAuthGuard, RolesGuard) // exige login en todo el controlador
export class EventoAmbientalController {
  constructor(private readonly eventoService: EventoAmbientalService) {}

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateEventoAmbientalDto): Promise<EventoAmbiental> {
    return this.eventoService.create(dto);
  }

  @Get()
  findAll(): Promise<EventoAmbiental[]> {
    return this.eventoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EventoAmbiental> {
    return this.eventoService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEventoAmbientalDto,
  ): Promise<EventoAmbiental> {
    return this.eventoService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventoService.remove(id);
  }
}