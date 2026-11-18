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
import { CuidadoService } from './cuidado.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateCuidadoDto } from './dto/create-cuidado.dto';
import { UpdateCuidadoDto } from './dto/update-cuidado.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Cuidado } from './entities/cuidado.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { OwnsResource } from '../auth/decorators/owns-resource.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
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

// Define el prefijo HTTP /cuidado para todos los endpoints.
@Controller('cuidado')
@ApiTags('Cuidados')
@ApiBearerAuth('access-token')
export class CuidadoController {
  // Inyecta el servicio de cuidados en el controlador.
  constructor(private readonly cuidadoService: CuidadoService) {}

  // Atiende las solicitudes POST /cuidado para crear un cuidado.
  @Post()
  @ApiOperation({ summary: 'Crear un cuidado' })
  @ApiResponse({ status: 201, description: 'Cuidado creado.', type: Cuidado })
  // Recibe los datos validados y devuelve el cuidado creado.
  create(@Body() createCuidadoDto: CreateCuidadoDto): Promise<Cuidado> {
    // Delega la creación al servicio.
    return this.cuidadoService.create(createCuidadoDto);
  }

  // Atiende las solicitudes GET /cuidado para obtener todos los cuidados.
  @Get()
  @ApiOperation({ summary: 'Listar cuidados' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Página de cuidados con total y última página.' })
  // Delega los parámetros validados al servicio para consultar una sola página.
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Cuidado>> {
    return this.cuidadoService.findAll(pagination);
  }

  // Atiende GET /cuidado/me y limita la consulta a árboles del usuario autenticado.
  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar mis cuidados' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Página de cuidados propios.' })
  findMine(
    @GetUser() usuario: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Cuidado>> {
    // Usa el ID firmado del JWT; el servicio filtra por propietario del árbol asociado.
    return this.cuidadoService.findMine(usuario.id_usuario, pagination);
  }

  // Atiende las solicitudes GET /cuidado/:id para obtener un cuidado.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cuidado' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Cuidado encontrado.', type: Cuidado })
  // Convierte el parámetro id a número y devuelve el cuidado correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cuidado> {
    // Delega la búsqueda al servicio.
    return this.cuidadoService.findOne(id);
  }

  // Atiende las solicitudes PATCH /cuidado/:id para actualizar un cuidado.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un cuidado propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Cuidado actualizado.', type: Cuidado })
  @ApiResponse({ status: 403, description: 'El usuario no es propietario.' })
  // Valida que el usuario autenticado sea dueño del árbol del cuidado.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('cuidado')
  // Recibe el identificador y los cambios parciales del cuidado.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCuidadoDto: UpdateCuidadoDto,
  ): Promise<Cuidado> {
    // Delega la actualización al servicio.
    return this.cuidadoService.update(id, updateCuidadoDto);
  }

  // Atiende las solicitudes DELETE /cuidado/:id para eliminar un cuidado.
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cuidado propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Cuidado eliminado.' })
  @ApiResponse({ status: 403, description: 'El usuario no es propietario.' })
  // Impide borrar cuidados pertenecientes a otro usuario.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('cuidado')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del cuidado que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.cuidadoService.remove(id);
  }
}
