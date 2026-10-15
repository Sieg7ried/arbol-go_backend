import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EspecieService } from './especie.service';
import { CreateEspecieDto } from './dto/create-especie.dto';
import { UpdateEspecieDto } from './dto/update-especie.dto';
import { Especie } from './entities/especie.entity';

@Controller('especie')
export class EspecieController {
  constructor(private readonly especieService: EspecieService) {}

  /**
   * POST /especie
   * Crear una nueva especie
   */
  @Post()
  create(@Body() createEspecieDto: CreateEspecieDto): Promise<Especie> {
    return this.especieService.create(createEspecieDto);
  }

  /**
   * GET /especie
   * Obtener todas las especies
   */
  @Get()
  findAll(): Promise<Especie[]> {
    return this.especieService.findAll();
  }

  /**
   * GET /especie/:id
   * Obtener una especie por ID
   */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Especie> {
    return this.especieService.findOne(id);
  }

  /**
   * PATCH /especie/:id
   * Actualizar una especie
   */
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEspecieDto: UpdateEspecieDto,
  ): Promise<Especie> {
    return this.especieService.update(id, updateEspecieDto);
  }

  /**
   * DELETE /especie/:id
   * Eliminar una especie (responde 204 No Content)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.especieService.remove(id);
  }
}