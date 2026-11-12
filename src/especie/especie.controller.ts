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
import { EspecieService } from './especie.service';
import { CreateEspecieDto } from './dto/create-especie.dto';
import { UpdateEspecieDto } from './dto/update-especie.dto';
import { Especie } from './entities/especie.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

/**
 * Controla las rutas HTTP del catálogo global de especies.
 * La consulta es pública, mientras que cualquier cambio exige autenticación y rol admin.
 */
@Controller('especie')
export class EspecieController {
  /** Servicio que ejecuta las operaciones de persistencia del catálogo. */
  constructor(private readonly especieService: EspecieService) {}

  /** Crea especies solo cuando JWT y rol administrador han sido verificados. */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createEspecieDto: CreateEspecieDto): Promise<Especie> {
    // El DTO valida los campos del catálogo; los guards bloquean usuarios sin rol administrador.
    return this.especieService.create(createEspecieDto);
  }

  /** La consulta del catálogo permanece pública. */
  @Get()
  findAll(): Promise<Especie[]> {
    return this.especieService.findAll();
  }

  /** La consulta individual del catálogo permanece pública. */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Especie> {
    // ParseIntPipe rechaza identificadores que no sean enteros antes de consultar el servicio.
    return this.especieService.findOne(id);
  }

  /** Actualiza especies solo para un administrador autenticado. */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEspecieDto: UpdateEspecieDto,
  ): Promise<Especie> {
    // Se valida el ID de ruta y se exige rol admin antes de ejecutar la modificación.
    return this.especieService.update(id, updateEspecieDto);
  }

  /** Elimina especies solo para un administrador autenticado. */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    // Se valida el identificador antes de delegar el borrado autorizado al servicio.
    return this.especieService.remove(id);
  }
}
