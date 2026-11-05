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
import { CuidadoService } from './cuidado.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateCuidadoDto } from './dto/create-cuidado.dto';
import { UpdateCuidadoDto } from './dto/update-cuidado.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Cuidado } from './entities/cuidado.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { OwnsResource } from '../auth/decorators/owns-resource.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
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
  @ApiResponse({ status: 200, description: 'Lista de cuidados.', type: Cuidado, isArray: true })
  // Devuelve la lista completa de cuidados.
  findAll(): Promise<Cuidado[]> {
    // Delega la consulta al servicio.
    return this.cuidadoService.findAll();
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
