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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

// Importa el servicio que contiene la lógica de negocio.
import { FotografiaService } from './fotografia.service';

// Importa los DTO utilizados para recibir datos de la API.
import { CreateFotografiaDto } from './dto/create-fotografia.dto';
import { UpdateFotografiaDto } from './dto/update-fotografia.dto';

// Importa la entidad utilizada como tipo de respuesta.
import { Fotografia } from './entities/fotografia.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../auth/guards/ownership.guard';
import { OwnsResource } from '../auth/decorators/owns-resource.decorator';
import { imageFileFilter } from './image-file.filter';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Define el prefijo HTTP /fotografia para todos los endpoints.
@Controller('fotografia')
@ApiTags('Fotografías')
@ApiBearerAuth('access-token')
export class FotografiaController {
  // Inyecta el servicio de fotografías en el controlador.
  constructor(private readonly fotografiaService: FotografiaService) {}

  // Atiende las solicitudes POST /fotografia para crear una fotografía.
  @Post()
  // Paso 1: valida el JWT antes de ejecutar la subida y consumir almacenamiento.
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Subir una fotografía' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imagen: { type: 'string', format: 'binary' },
        id_arbol: { type: 'number', example: 1 },
        fecha: { type: 'string', format: 'date-time' },
        descripcion: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fotografía almacenada.', type: Fotografia })
  // Intercepta multipart/form-data y conserva el archivo en memoria para Cloudinary.
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  // Recibe los datos validados y devuelve la fotografía creada.
  create(
    @Body() createFotografiaDto: CreateFotografiaDto,
    // Recibe el archivo validado por Multer desde el campo multipart "imagen".
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Fotografia> {
    // Delega datos y buffer para que el servicio persista solo secure_url.
    return this.fotografiaService.create(createFotografiaDto, file);
  }

  // Atiende las solicitudes GET /fotografia para obtener todas las fotografías.
  @Get()
  @ApiOperation({ summary: 'Listar fotografías' })
  @ApiResponse({ status: 200, description: 'Lista de fotografías.', type: Fotografia, isArray: true })
  // Devuelve la lista completa de fotografías.
  findAll(): Promise<Fotografia[]> {
    // Delega la consulta al servicio.
    return this.fotografiaService.findAll();
  }

  // Atiende las solicitudes GET /fotografia/:id para obtener una fotografía.
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una fotografía' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Fotografía encontrada.', type: Fotografia })
  // Convierte el parámetro id a número y devuelve la fotografía correspondiente.
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Fotografia> {
    // Delega la búsqueda al servicio.
    return this.fotografiaService.findOne(id);
  }

  // Atiende las solicitudes PATCH /fotografia/:id para actualizar una fotografía.
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una fotografía' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imagen: { type: 'string', format: 'binary' },
        fecha: { type: 'string', format: 'date-time' },
        descripcion: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Fotografía actualizada.', type: Fotografia })
  // Intercepta opcionalmente una nueva imagen para reemplazar la anterior.
  @UseInterceptors(
    FileInterceptor('imagen', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: imageFileFilter,
    }),
  )
  // Paso 1: autentica; paso 2: verifica que el usuario sea dueño del recurso.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('fotografia')
  // Recibe el identificador y los cambios parciales de la fotografía.
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFotografiaDto: UpdateFotografiaDto,
    // Recibe un archivo opcional para reemplazo en Cloudinary.
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Fotografia> {
    // Delega la actualización y la eventual subida al servicio.
    return this.fotografiaService.update(id, updateFotografiaDto, file);
  }

  // Atiende las solicitudes DELETE /fotografia/:id para eliminar una fotografía.
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una fotografía propia' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiResponse({ status: 204, description: 'Fotografía eliminada.' })
  // Paso 1: autentica; paso 2: verifica propiedad antes de permitir el borrado.
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @OwnsResource('fotografia')
  // Devuelve el estado HTTP 204 sin contenido después de eliminar.
  @HttpCode(HttpStatus.NO_CONTENT)
  // Recibe el identificador de la fotografía que se eliminará.
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Delega la eliminación al servicio.
    return this.fotografiaService.remove(id);
  }
}
