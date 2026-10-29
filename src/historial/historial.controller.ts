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
import { HistorialService } from './historial.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Historial } from './entities/historial.entity';

// Define el prefijo HTTP /historial para todos los endpoints.
@Controller('historial')
export class HistorialController {
  // Inyecta el servicio de historiales en el controlador.
  constructor(private readonly historialService: HistorialService) {}

  // Atiende las solicitudes POST /historial para crear un historial.
  @Post()
  // Recibe los datos validados y devuelve el historial creado.
  create(@Body() createHistorialDto: CreateHistorialDto): Promise<Historial> {
    // Delega la creación al servicio.
    return this.historialService.create(createHistorialDto);
  }

  // Atiende las solicitudes GET /historial para obtener todos los historiales.
  @Get()
  // Devuelve la lista completa de historiales.
  findAll(): Promise<Historial[]> {
    // Delega la consulta al servicio.
    return this.historialService.findAll();
  }

  // Atiende las solicitudes GET /historial/:id para obtener un historial.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve el historial correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Historial> {
    // Delega la búsqueda al servicio.
    return this.historialService.findOne(id);
  }

  // Atiende las solicitudes PATCH /historial/:id para actualizar un historial.
  @Patch(':id')
  // Recibe el identificador y los cambios parciales del historial.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistorialDto: UpdateHistorialDto,
  ): Promise<Historial> {
    // Delega la actualización al servicio.
    return this.historialService.update(id, updateHistorialDto);
  }

  // Atiende las solicitudes DELETE /historial/:id para eliminar un historial.
  @Delete(':id')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del historial que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.historialService.remove(id);
  }
}
