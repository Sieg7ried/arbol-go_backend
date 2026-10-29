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
import { ComentarioService } from './comentario.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Comentario } from './entities/comentario.entity';

// Define el prefijo HTTP /comentario para todos los endpoints.
@Controller('comentario')
export class ComentarioController {
  // Inyecta el servicio de comentarios en el controlador.
  constructor(private readonly comentarioService: ComentarioService) {}

  // Atiende las solicitudes POST /comentario para crear un comentario.
  @Post()
  // Recibe los datos validados y devuelve el comentario creado.
  create(
    @Body() createComentarioDto: CreateComentarioDto,
  ): Promise<Comentario> {
    // Delega la creación al servicio.
    return this.comentarioService.create(createComentarioDto);
  }

  // Atiende las solicitudes GET /comentario para obtener todos los comentarios.
  @Get()
  // Devuelve la lista completa de comentarios.
  findAll(): Promise<Comentario[]> {
    // Delega la consulta al servicio.
    return this.comentarioService.findAll();
  }

  // Atiende las solicitudes GET /comentario/:id para obtener un comentario.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve el comentario correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Comentario> {
    // Delega la búsqueda al servicio.
    return this.comentarioService.findOne(id);
  }

  // Atiende las solicitudes PATCH /comentario/:id para actualizar un comentario.
  @Patch(':id')
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
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del comentario que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.comentarioService.remove(id);
  }
}
