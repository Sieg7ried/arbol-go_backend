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
import { ArbolService } from './arbol.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateArbolDto } from './dto/create-arbol.dto';
import { UpdateArbolDto } from './dto/update-arbol.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Arbol } from './entities/arbol.entity';

// Define el prefijo HTTP /arbol para todos los endpoints del controlador.
@Controller('arbol')
export class ArbolController {
  // Inyecta el servicio de árboles en el controlador.
  constructor(private readonly arbolService: ArbolService) {}

  // Atiende las solicitudes POST /arbol para crear un árbol.
  @Post()
  // Recibe los datos validados y devuelve el árbol creado.
  create(@Body() createArbolDto: CreateArbolDto): Promise<Arbol> {
    // Delega la creación al servicio.
    return this.arbolService.create(createArbolDto);
  }

  // Atiende las solicitudes GET /arbol para obtener todos los árboles.
  @Get()
  // Devuelve la lista completa de árboles.
  findAll(): Promise<Arbol[]> {
    // Delega la consulta al servicio.
    return this.arbolService.findAll();
  }

  // Atiende las solicitudes GET /arbol/:id para obtener un árbol.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve el árbol correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Arbol> {
    // Delega la búsqueda al servicio.
    return this.arbolService.findOne(id);
  }

  // Atiende las solicitudes PATCH /arbol/:id para actualizar un árbol.
  @Patch(':id')
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
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del árbol que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.arbolService.remove(id);
  }
}
