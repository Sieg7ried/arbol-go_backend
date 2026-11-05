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
import { ParticipacionService } from './participacion.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateParticipacionDto } from './dto/create-participacion.dto';
import { UpdateParticipacionDto } from './dto/update-participacion.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Participacion } from './entities/participacion.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Define el prefijo HTTP /participacion para todos los endpoints.
@Controller('participacion')
@ApiTags('Participaciones')
@ApiBearerAuth('access-token')
export class ParticipacionController {
  // Inyecta el servicio de participaciones.
  constructor(
    private readonly participacionService: ParticipacionService,
  ) {}

  // Atiende las solicitudes POST /participacion para registrar una inscripción.
  @Post()
  @ApiOperation({ summary: 'Crear una participación' })
  @ApiResponse({ status: 201, description: 'Participación creada.', type: Participacion })
  // Recibe los datos validados y devuelve la participación creada.
  create(
    @Body() createParticipacionDto: CreateParticipacionDto,
  ): Promise<Participacion> {
    // Delega la creación al servicio.
    return this.participacionService.create(createParticipacionDto);
  }

  // Atiende las solicitudes GET /participacion para listar las participaciones.
  @Get()
  @ApiOperation({ summary: 'Listar participaciones' })
  @ApiResponse({ status: 200, description: 'Lista de participaciones.', type: Participacion, isArray: true })
  // Devuelve todas las participaciones registradas.
  findAll(): Promise<Participacion[]> {
    // Delega la consulta al servicio.
    return this.participacionService.findAll();
  }

  // Atiende las solicitudes GET /participacion/:id_usuario/:id_evento.
  @Get(':id_usuario/:id_evento')
  @ApiOperation({ summary: 'Obtener una participación' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_evento', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Participación encontrada.', type: Participacion })
  // Convierte ambos parámetros a número y busca la clave compuesta.
  findOne(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_evento', ParseIntPipe) id_evento: number,
  ): Promise<Participacion> {
    // Delega la búsqueda al servicio.
    return this.participacionService.findOne(id_usuario, id_evento);
  }

  // Atiende las solicitudes PATCH /participacion/:id_usuario/:id_evento.
  @Patch(':id_usuario/:id_evento')
  @ApiOperation({ summary: 'Actualizar una participación' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_evento', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Participación actualizada.', type: Participacion })
  // Recibe la clave compuesta y los cambios parciales.
  update(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_evento', ParseIntPipe) id_evento: number,
    @Body() updateParticipacionDto: UpdateParticipacionDto,
  ): Promise<Participacion> {
    // Delega la actualización al servicio.
    return this.participacionService.update(
      id_usuario,
      id_evento,
      updateParticipacionDto,
    );
  }

  // Atiende las solicitudes DELETE /participacion/:id_usuario/:id_evento.
  @Delete(':id_usuario/:id_evento')
  @ApiOperation({ summary: 'Eliminar una participación' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_evento', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Participación eliminada.' })
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe la clave compuesta del registro que se eliminará.
  remove(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_evento', ParseIntPipe) id_evento: number,
  ): Promise<void> {
    // Delega la eliminación al servicio.
    return this.participacionService.remove(id_usuario, id_evento);
  }
}
