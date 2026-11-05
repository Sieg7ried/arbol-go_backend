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
  UseGuards,
} from '@nestjs/common';

// Importa el servicio que contiene la lógica de negocio.
import { RecordatorioService } from './recordatorio.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Recordatorio } from './entities/recordatorio.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { OwnsResource } from '../auth/decorators/owns-resource.decorator';

// Define el prefijo HTTP /recordatorio para todos los endpoints.
@Controller('recordatorio')
@ApiTags('Recordatorios')
@ApiBearerAuth('access-token')
export class RecordatorioController {
  // Inyecta el servicio de recordatorios en el controlador.
  constructor(
    private readonly recordatorioService: RecordatorioService,
  ) {}

  // Atiende las solicitudes POST /recordatorio para crear un recordatorio.
  @Post()
  @ApiOperation({ summary: 'Crear un recordatorio' })
  @ApiResponse({ status: 201, description: 'Recordatorio creado.', type: Recordatorio })
  // Recibe los datos validados y devuelve el recordatorio creado.
  create(
    @Body() createRecordatorioDto: CreateRecordatorioDto,
  ): Promise<Recordatorio> {
    // Delega la creación al servicio.
    return this.recordatorioService.create(createRecordatorioDto);
  }

  // Atiende las solicitudes GET /recordatorio para obtener todos los recordatorios.
  @Get()
  @ApiOperation({ summary: 'Listar recordatorios' })
  @ApiResponse({ status: 200, description: 'Lista de recordatorios.', type: Recordatorio, isArray: true })
  // Devuelve la lista completa de recordatorios.
  findAll(): Promise<Recordatorio[]> {
    // Delega la consulta al servicio.
    return this.recordatorioService.findAll();
  }

  // Atiende las solicitudes GET /recordatorio/:id para obtener un recordatorio.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un recordatorio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Recordatorio encontrado.', type: Recordatorio })
  // Convierte el parámetro id a número y devuelve el recordatorio correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Recordatorio> {
    // Delega la búsqueda al servicio.
    return this.recordatorioService.findOne(id);
  }

  // Atiende las solicitudes PATCH /recordatorio/:id para actualizar un recordatorio.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un recordatorio propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Recordatorio actualizado.', type: Recordatorio })
  // Valida la propiedad indirecta recordatorio -> árbol -> usuario.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('recordatorio')
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
  @ApiOperation({ summary: 'Eliminar un recordatorio propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Recordatorio eliminado.' })
  // Impide borrar recordatorios asociados a árboles ajenos.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('recordatorio')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del recordatorio que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.recordatorioService.remove(id);
  }
}
