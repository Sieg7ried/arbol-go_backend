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
import { PublicacionService } from './publicacion.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Publicacion } from './entities/publicacion.entity';

// Define el prefijo HTTP /publicacion para todos los endpoints.
@Controller('publicacion')
export class PublicacionController {
  // Inyecta el servicio de publicaciones en el controlador.
  constructor(private readonly publicacionService: PublicacionService) {}

  // Atiende las solicitudes POST /publicacion para crear una publicación.
  @Post()
  // Recibe los datos validados y devuelve la publicación creada.
  create(
    @Body() createPublicacionDto: CreatePublicacionDto,
  ): Promise<Publicacion> {
    // Delega la creación al servicio.
    return this.publicacionService.create(createPublicacionDto);
  }

  // Atiende las solicitudes GET /publicacion para obtener todas las publicaciones.
  @Get()
  // Devuelve la lista completa de publicaciones.
  findAll(): Promise<Publicacion[]> {
    // Delega la consulta al servicio.
    return this.publicacionService.findAll();
  }

  // Atiende las solicitudes GET /publicacion/:id para obtener una publicación.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve la publicación correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Publicacion> {
    // Delega la búsqueda al servicio.
    return this.publicacionService.findOne(id);
  }

  // Atiende las solicitudes PATCH /publicacion/:id para actualizar una publicación.
  @Patch(':id')
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
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador de la publicación que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.publicacionService.remove(id);
  }
}
