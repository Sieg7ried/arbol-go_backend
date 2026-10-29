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
import { RecordatorioService } from './recordatorio.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Recordatorio } from './entities/recordatorio.entity';

// Define el prefijo HTTP /recordatorio para todos los endpoints.
@Controller('recordatorio')
export class RecordatorioController {
  // Inyecta el servicio de recordatorios en el controlador.
  constructor(
    private readonly recordatorioService: RecordatorioService,
  ) {}

  // Atiende las solicitudes POST /recordatorio para crear un recordatorio.
  @Post()
  // Recibe los datos validados y devuelve el recordatorio creado.
  create(
    @Body() createRecordatorioDto: CreateRecordatorioDto,
  ): Promise<Recordatorio> {
    // Delega la creación al servicio.
    return this.recordatorioService.create(createRecordatorioDto);
  }

  // Atiende las solicitudes GET /recordatorio para obtener todos los recordatorios.
  @Get()
  // Devuelve la lista completa de recordatorios.
  findAll(): Promise<Recordatorio[]> {
    // Delega la consulta al servicio.
    return this.recordatorioService.findAll();
  }

  // Atiende las solicitudes GET /recordatorio/:id para obtener un recordatorio.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve el recordatorio correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Recordatorio> {
    // Delega la búsqueda al servicio.
    return this.recordatorioService.findOne(id);
  }

  // Atiende las solicitudes PATCH /recordatorio/:id para actualizar un recordatorio.
  @Patch(':id')
  // Recibe el identificador y los cambios parciales del recordatorio.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRecordatorioDto: UpdateRecordatorioDto,
  ): Promise<Recordatorio> {
    // Delega la actualización al servicio.
    return this.recordatorioService.update(id, updateRecordatorioDto);
  }

  // Atiende las solicitudes DELETE /recordatorio/:id para eliminar un recordatorio.
  @Delete(':id')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del recordatorio que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.recordatorioService.remove(id);
  }
}
