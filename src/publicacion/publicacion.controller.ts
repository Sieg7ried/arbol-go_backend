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
import { PublicacionService } from './publicacion.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Publicacion } from './entities/publicacion.entity';
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

// Define el prefijo HTTP /publicacion para todos los endpoints.
@Controller('publicacion')
@ApiTags('Publicaciones')
@ApiBearerAuth('access-token')
export class PublicacionController {
  // Inyecta el servicio de publicaciones en el controlador.
  constructor(private readonly publicacionService: PublicacionService) {}

  // Atiende las solicitudes POST /publicacion para crear una publicación.
  @Post()
  @ApiOperation({ summary: 'Crear una publicación' })
  @ApiResponse({ status: 201, description: 'Publicación creada.', type: Publicacion })
  // Recibe los datos validados y devuelve la publicación creada.
  create(
    @Body() createPublicacionDto: CreatePublicacionDto,
  ): Promise<Publicacion> {
    // Delega la creación al servicio.
    return this.publicacionService.create(createPublicacionDto);
  }

  // Atiende las solicitudes GET /publicacion para obtener todas las publicaciones.
  @Get()
  @ApiOperation({ summary: 'Listar publicaciones' })
  @ApiResponse({ status: 200, description: 'Lista de publicaciones.', type: Publicacion, isArray: true })
  // Devuelve la lista completa de publicaciones.
  findAll(): Promise<Publicacion[]> {
    // Delega la consulta al servicio.
    return this.publicacionService.findAll();
  }

  // Atiende las solicitudes GET /publicacion/:id para obtener una publicación.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una publicación' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Publicación encontrada.', type: Publicacion })
  // Convierte el parámetro id a número y devuelve la publicación correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Publicacion> {
    // Delega la búsqueda al servicio.
    return this.publicacionService.findOne(id);
  }

  // Atiende las solicitudes PATCH /publicacion/:id para actualizar una publicación.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una publicación propia' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Publicación actualizada.', type: Publicacion })
  // Valida que solo el autor autenticado pueda modificar la publicación.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('publicacion')
  // Recibe el identificador y los cambios parciales de la publicación.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePublicacionDto: UpdatePublicacionDto,
  ): Promise<Publicacion> {
    // Delega la actualización al servicio.
    return this.publicacionService.update(id, updatePublicacionDto);
  }

  // Atiende las solicitudes DELETE /publicacion/:id para eliminar una publicación.
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una publicación propia' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Publicación eliminada.' })
  // Protege el borrado normal contra acceso a publicaciones ajenas.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('publicacion')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador de la publicación que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.publicacionService.remove(id);
  }

  // Permite reportar una publicación para revisión administrativa.
  @Post(':id/report')
  @ApiOperation({ summary: 'Reportar una publicación' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 201, description: 'Publicación reportada.', type: Publicacion })
  // Requiere identidad para evitar reportes anónimos no auditables.
  @UseGuards(JwtAuthGuard)
  report(@Param('id', ParseIntPipe) id: number): Promise<Publicacion> {
    // Marca el recurso como reportado sin eliminarlo.
    return this.publicacionService.report(id);
  }

  // Permite eliminar publicaciones reportadas de otros usuarios únicamente a administradores.
  @Delete(':id/moderate')
  @ApiOperation({ summary: 'Moderar una publicación reportada' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Publicación moderada.' })
  @ApiResponse({ status: 403, description: 'Se requiere ADMIN o no está reportada.' })
  // Combina autenticación y autorización RBAC para moderación.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  moderateRemove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // El servicio verifica además que la publicación esté reportada.
    return this.publicacionService.removeReportedByAdmin(id);
  }
}
