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
import { CuidadoService } from './cuidado.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateCuidadoDto } from './dto/create-cuidado.dto';
import { UpdateCuidadoDto } from './dto/update-cuidado.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Cuidado } from './entities/cuidado.entity';

// Define el prefijo HTTP /cuidado para todos los endpoints.
@Controller('cuidado')
export class CuidadoController {
  // Inyecta el servicio de cuidados en el controlador.
  constructor(private readonly cuidadoService: CuidadoService) {}

  // Atiende las solicitudes POST /cuidado para crear un cuidado.
  @Post()
  // Recibe los datos validados y devuelve el cuidado creado.
  create(@Body() createCuidadoDto: CreateCuidadoDto): Promise<Cuidado> {
    // Delega la creación al servicio.
    return this.cuidadoService.create(createCuidadoDto);
  }

  // Atiende las solicitudes GET /cuidado para obtener todos los cuidados.
  @Get()
  // Devuelve la lista completa de cuidados.
  findAll(): Promise<Cuidado[]> {
    // Delega la consulta al servicio.
    return this.cuidadoService.findAll();
  }

  // Atiende las solicitudes GET /cuidado/:id para obtener un cuidado.
  @Get(':id')
  // Convierte el parámetro id a número y devuelve el cuidado correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Cuidado> {
    // Delega la búsqueda al servicio.
    return this.cuidadoService.findOne(id);
  }

  // Atiende las solicitudes PATCH /cuidado/:id para actualizar un cuidado.
  @Patch(':id')
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
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador del cuidado que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.cuidadoService.remove(id);
  }
}
