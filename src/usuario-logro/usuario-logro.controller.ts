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
import { UsuarioLogroService } from './usuario-logro.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateUsuarioLogroDto } from './dto/create-usuario-logro.dto';
import { UpdateUsuarioLogroDto } from './dto/update-usuario-logro.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { UsuarioLogro } from './entities/usuario-logro.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Define el prefijo HTTP /usuario-logro para todos los endpoints.
@Controller('usuario-logro')
@ApiTags('Logros de usuario')
@ApiBearerAuth('access-token')
export class UsuarioLogroController {
  // Inyecta el servicio de relaciones usuario-logro.
  constructor(
    private readonly usuarioLogroService: UsuarioLogroService,
  ) {}

  // Atiende las solicitudes POST /usuario-logro para registrar un logro.
  @Post()
  @ApiOperation({ summary: 'Asignar un logro a un usuario' })
  @ApiResponse({ status: 201, description: 'Logro asignado.', type: UsuarioLogro })
  // Recibe los datos validados y devuelve la relación creada.
  create(
    @Body() createUsuarioLogroDto: CreateUsuarioLogroDto,
  ): Promise<UsuarioLogro> {
    // Delega la creación al servicio.
    return this.usuarioLogroService.create(createUsuarioLogroDto);
  }

  // Atiende las solicitudes GET /usuario-logro para listar las relaciones.
  @Get()
  @ApiOperation({ summary: 'Listar logros de usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de relaciones.', type: UsuarioLogro, isArray: true })
  // Devuelve todas las relaciones registradas.
  findAll(): Promise<UsuarioLogro[]> {
    // Delega la consulta al servicio.
    return this.usuarioLogroService.findAll();
  }

  // Atiende las solicitudes GET /usuario-logro/:id_usuario/:id_logro.
  @Get(':id_usuario/:id_logro')
  @ApiOperation({ summary: 'Obtener un logro de usuario' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_logro', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Relación encontrada.', type: UsuarioLogro })
  // Convierte ambos parámetros a número y busca la clave compuesta.
  findOne(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_logro', ParseIntPipe) id_logro: number,
  ): Promise<UsuarioLogro> {
    // Delega la búsqueda al servicio.
    return this.usuarioLogroService.findOne(id_usuario, id_logro);
  }

  // Atiende las solicitudes PATCH /usuario-logro/:id_usuario/:id_logro.
  @Patch(':id_usuario/:id_logro')
  @ApiOperation({ summary: 'Actualizar un logro de usuario' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_logro', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Relación actualizada.', type: UsuarioLogro })
  // Recibe la clave compuesta y los cambios parciales.
  update(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_logro', ParseIntPipe) id_logro: number,
    @Body() updateUsuarioLogroDto: UpdateUsuarioLogroDto,
  ): Promise<UsuarioLogro> {
    // Delega la actualización al servicio.
    return this.usuarioLogroService.update(
      id_usuario,
      id_logro,
      updateUsuarioLogroDto,
    );
  }

  // Atiende las solicitudes DELETE /usuario-logro/:id_usuario/:id_logro.
  @Delete(':id_usuario/:id_logro')
  @ApiOperation({ summary: 'Eliminar un logro de usuario' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_logro', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Relación eliminada.' })
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe la clave compuesta del registro que se eliminará.
  remove(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_logro', ParseIntPipe) id_logro: number,
  ): Promise<void> {
    // Delega la eliminación al servicio.
    return this.usuarioLogroService.remove(id_usuario, id_logro);
  }
}
