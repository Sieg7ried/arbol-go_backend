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
import { ComentarioService } from './comentario.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Comentario } from './entities/comentario.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { OwnsResource } from '../auth/decorators/owns-resource.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Define el prefijo HTTP /comentario para todos los endpoints.
@Controller('comentario')
@ApiTags('Comentarios')
@ApiBearerAuth('access-token')
export class ComentarioController {
  // Inyecta el servicio de comentarios en el controlador.
  constructor(private readonly comentarioService: ComentarioService) {}

  // Atiende las solicitudes POST /comentario para crear un comentario.
  @Post()
  @ApiOperation({ summary: 'Crear un comentario' })
  @ApiResponse({ status: 201, description: 'Comentario creado.', type: Comentario })
  // Recibe los datos validados y devuelve el comentario creado.
  create(
    @Body() createComentarioDto: CreateComentarioDto,
  ): Promise<Comentario> {
    // Delega la creación al servicio.
    return this.comentarioService.create(createComentarioDto);
  }

  // Atiende las solicitudes GET /comentario para obtener todos los comentarios.
  @Get()
  @ApiOperation({ summary: 'Listar comentarios' })
  @ApiResponse({ status: 200, description: 'Lista de comentarios.', type: Comentario, isArray: true })
  // Devuelve la lista completa de comentarios.
  findAll(): Promise<Comentario[]> {
    // Delega la consulta al servicio.
    return this.comentarioService.findAll();
  }

  // Atiende las solicitudes GET /comentario/:id para obtener un comentario.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un comentario' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comentario encontrado.', type: Comentario })
  // Convierte el parámetro id a número y devuelve el comentario correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Comentario> {
    // Delega la búsqueda al servicio.
    return this.comentarioService.findOne(id);
  }

  // Atiende las solicitudes PATCH /comentario/:id para actualizar un comentario.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un comentario propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Comentario actualizado.', type: Comentario })
  // Valida que solo el autor autenticado pueda modificar el comentario.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('comentario')
  // Recibe el identificador y los cambios parciales del comentario.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateComentarioDto: UpdateComentarioDto,
  ): Promise<Comentario> {
    // Delega la actualización al servicio.
    return this.comentarioService.update(id, updateComentarioDto);
  }

  // Atiende las solicitudes DELETE /comentario/:id para eliminar un comentario.
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un comentario propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Comentario eliminado.' })
  // Protege el borrado normal contra comentarios de otros usuarios.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('comentario')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del comentario que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.comentarioService.remove(id);
  }

  // Permite reportar un comentario para revisión administrativa.
  @Post(':id/report')
  @ApiOperation({ summary: 'Reportar un comentario' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 201, description: 'Comentario reportado.', type: Comentario })
  // Requiere autenticación para registrar quién inicia el reporte.
  @UseGuards(JwtAuthGuard)
  report(@Param('id', ParseIntPipe) id: number): Promise<Comentario> {
    // Marca el comentario como reportado sin modificar su autoría.
    return this.comentarioService.report(id);
  }

  // Permite a un administrador eliminar únicamente comentarios reportados.
  @Delete(':id/moderate')
  @ApiOperation({ summary: 'Moderar un comentario reportado' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Comentario moderado.' })
  @ApiResponse({ status: 403, description: 'Se requiere ADMIN o no está reportado.' })
  // Protege la moderación mediante el rol administrativo.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  moderateRemove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // El servicio exige que exista un reporte antes de borrar.
    return this.comentarioService.removeReportedByAdmin(id);
  }
}
