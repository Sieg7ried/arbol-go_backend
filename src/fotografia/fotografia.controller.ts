// Importa los decoradores HTTP y las utilidades de validación de parámetros.
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

// Importa el servicio que contiene la lógica de negocio.
import { FotografiaService } from './fotografia.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateFotografiaDto } from './dto/create-fotografia.dto';
import { UpdateFotografiaDto } from './dto/update-fotografia.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Fotografia } from './entities/fotografia.entity';

// Define el prefijo HTTP /fotografia para todos los endpoints.
@Controller('fotografia')
export class FotografiaController {
  // Inyecta el servicio de fotografías en el controlador.
  constructor(private readonly fotografiaService: FotografiaService) {}

  // Atiende las solicitudes POST /fotografia para crear una fotografía.
  @Post()
  // Recibe los datos validados y devuelve la fotografía creada.
  create(
    @Body() createFotografiaDto: CreateFotografiaDto,
  ): Promise<Fotografia> {
    // Delega la creación al servicio.
    return this.fotografiaService.create(createFotografiaDto);
  }

  // Atiende las solicitudes GET /fotografia para obtener todas las fotografías.
  @Get()
  // Devuelve la lista completa de fotografías.
  findAll(): Promise<Fotografia[]> {
    // Delega la consulta al servicio.
    return this.fotografiaService.findAll();
  }

  // Atiende las solicitudes GET /fotografia/:id para obtener una fotografía.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve la fotografía correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Fotografia> {
    // Delega la búsqueda al servicio.
    return this.fotografiaService.findOne(id);
  }

  // Atiende las solicitudes PATCH /fotografia/:id para actualizar una fotografía.
  @Patch(':id')
  // Recibe el identificador y los cambios parciales de la fotografía.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFotografiaDto: UpdateFotografiaDto,
  ): Promise<Fotografia> {
    // Delega la actualización al servicio.
    return this.fotografiaService.update(id, updateFotografiaDto);
  }

  // Atiende las solicitudes DELETE /fotografia/:id para eliminar una fotografía.
  @Delete(':id')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador de la fotografía que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.fotografiaService.remove(id);
  }
}
