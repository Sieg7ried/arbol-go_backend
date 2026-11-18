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
  Query,
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
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateReporteDto } from '../reporte/dto/create-reporte.dto';
import { Reporte } from '../reporte/entities/reporte.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
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
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Página de publicaciones visibles.' })
  // Delega los parámetros validados para limitar la cantidad de resultados devueltos.
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Publicacion>> {
    return this.publicacionService.findAll(pagination);
  }

  // Atiende GET /publicacion/me y restringe los resultados al usuario autenticado.
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar mis publicaciones visibles' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Página de publicaciones propias visibles.' })
  findMine(
    @GetUser() usuario: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Publicacion>> {
    // Usa el ID verificado del JWT; el servicio también excluye publicaciones ocultas.
    return this.publicacionService.findMine(usuario.id_usuario, pagination);
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
  @ApiResponse({ status: 201, description: 'Reporte registrado.', type: Reporte })
  @ApiResponse({ status: 409, description: 'El usuario ya reportó o el contenido está oculto.' })
  // Requiere identidad para evitar reportes anónimos no auditables.
  @UseGuards(JwtAuthGuard)
  report(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() usuario: AuthenticatedUser,
    @Body() dto: CreateReporteDto,
  ): Promise<Reporte> {
    // Pasa al servicio el ID verificado por JWT, nunca uno proporcionado en el body.
    return this.publicacionService.report(id, usuario.id_usuario, dto);
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
