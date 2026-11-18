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
import { LogroService } from './logro.service';
import { CreateLogroDto } from './dto/create-logro.dto';
import { UpdateLogroDto } from './dto/update-logro.dto';
import { Logro } from './entities/logro.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

/**
 * Controla las rutas HTTP del catálogo global de logros.
 * La consulta es pública; la creación, actualización y eliminación son administrativas.
 */
@Controller('logro')
@ApiTags('Logros')
export class LogroController {
  /** Servicio que ejecuta las operaciones de persistencia del catálogo. */
  constructor(private readonly logroService: LogroService) {}

  /** Crea logros solo cuando JWT y rol administrador han sido verificados. */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createLogroDto: CreateLogroDto): Promise<Logro> {
    // El DTO valida los datos y los guards bloquean creaciones por usuarios sin rol admin.
    return this.logroService.create(createLogroDto);
  }

  /** La consulta del catálogo permanece pública. */
  @Get()
  @ApiOperation({ summary: 'Listar el catálogo paginado de logros' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Página del catálogo con total y última página.' })
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<Logro>> {
    return this.logroService.findAll(pagination);
  }

  /** La consulta individual del catálogo permanece pública. */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Logro> {
    // ParseIntPipe valida el identificador para rechazar parámetros malformados.
    return this.logroService.findOne(id);
  }

  /** Actualiza logros solo para un administrador autenticado. */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLogroDto: UpdateLogroDto,
  ): Promise<Logro> {
    // Se valida el ID y se exige rol admin antes de ejecutar la modificación.
    return this.logroService.update(id, updateLogroDto);
  }

  /** Elimina logros solo para un administrador autenticado. */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // El identificador se valida antes de delegar el borrado autorizado.
    return this.logroService.remove(id);
  }
}
