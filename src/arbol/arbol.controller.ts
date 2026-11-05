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
import { ArbolService } from './arbol.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateArbolDto } from './dto/create-arbol.dto';
import { UpdateArbolDto } from './dto/update-arbol.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Arbol } from './entities/arbol.entity';
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

// Define el prefijo HTTP /arbol para todos los endpoints del controlador.
@Controller('arbol')
@ApiTags('Árboles')
@ApiBearerAuth('access-token')
export class ArbolController {
  // Inyecta el servicio de árboles en el controlador.
  constructor(private readonly arbolService: ArbolService) {}

  // Atiende las solicitudes POST /arbol para crear un árbol.
  @Post()
  @ApiOperation({ summary: 'Crear un árbol' })
  @ApiResponse({ status: 201, description: 'Árbol creado.', type: Arbol })
  // Recibe los datos validados y devuelve el árbol creado.
  create(@Body() createArbolDto: CreateArbolDto): Promise<Arbol> {
    // Delega la creación al servicio.
    return this.arbolService.create(createArbolDto);
  }

  // Atiende las solicitudes GET /arbol para obtener todos los árboles.
  @Get()
  @ApiOperation({ summary: 'Listar árboles' })
  @ApiResponse({ status: 200, description: 'Lista de árboles.', type: Arbol, isArray: true })
  // Devuelve la lista completa de árboles.
  findAll(): Promise<Arbol[]> {
    // Delega la consulta al servicio.
    return this.arbolService.findAll();
  }

  // Atiende las solicitudes GET /arbol/:id para obtener un árbol.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un árbol' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Árbol encontrado.', type: Arbol })
  @ApiResponse({ status: 404, description: 'Árbol no encontrado.' })
  // Convierte el parámetro id a número y devuelve el árbol correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Arbol> {
    // Delega la búsqueda al servicio.
    return this.arbolService.findOne(id);
  }

  // Atiende las solicitudes PATCH /arbol/:id para actualizar un árbol.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un árbol propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Árbol actualizado.', type: Arbol })
  @ApiResponse({ status: 403, description: 'El usuario no es propietario.' })
  // Exige JWT y propiedad real del árbol para prevenir acceso horizontal.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('arbol')
  // Recibe el identificador y los cambios parciales del árbol.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArbolDto: UpdateArbolDto,
  ): Promise<Arbol> {
    // Delega la actualización al servicio.
    return this.arbolService.update(id, updateArbolDto);
  }

  // Atiende las solicitudes DELETE /arbol/:id para eliminar un árbol.
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un árbol propio' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Árbol eliminado.' })
  @ApiResponse({ status: 403, description: 'El usuario no es propietario.' })
  // Exige JWT y propiedad real antes de permitir el borrado.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('arbol')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del árbol que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.arbolService.remove(id);
  }
}
