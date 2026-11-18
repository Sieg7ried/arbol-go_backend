import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsuarioLogroService } from './usuario-logro.service';
import { UsuarioLogro } from './entities/usuario-logro.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { GetUser } from '../auth/decorators/get-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PaginationDto } from '../common/dto/pagination.dto';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';

/**
 * Expone consultas administrativas de logros de usuarios.
 * Las asignaciones y cambios se gestionan desde servicios internos, no mediante HTTP.
 */
@Controller('usuario-logro')
@ApiTags('Logros de usuario')
@ApiBearerAuth('access-token')
export class UsuarioLogroController {
  /** Servicio de relaciones, disponible también para los módulos internos del backend. */
  constructor(private readonly usuarioLogroService: UsuarioLogroService) {}

  /** Lista relaciones paginadas y accesible únicamente por un administrador autenticado. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar logros de usuarios (administrador)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Página de relaciones con total y última página.',
  })
  findAll(
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<UsuarioLogro>> {
    // Los guards del método evitan que usuarios no administradores enumeren todas las relaciones.
    return this.usuarioLogroService.findAll(pagination);
  }

  /** Consulta únicamente los logros concedidos al usuario presente en el JWT. */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Listar mis logros obtenidos' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'Página de logros obtenidos por el usuario autenticado.' })
  findMine(
    @GetUser() usuario: AuthenticatedUser,
    @Query() pagination: PaginationDto,
  ): Promise<PaginatedResult<UsuarioLogro>> {
    // Obtiene el ID desde el JWT y filtra en el servicio, sin aceptar IDs de usuario en la ruta.
    return this.usuarioLogroService.findMine(usuario.id_usuario, pagination);
  }

  /** Consulta una relación existente y no crea ni modifica asignaciones. */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get(':id_usuario/:id_logro')
  @ApiOperation({ summary: 'Obtener un logro de usuario (administrador)' })
  @ApiParam({ name: 'id_usuario', type: Number, example: 1 })
  @ApiParam({ name: 'id_logro', type: Number, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Relación encontrada.',
    type: UsuarioLogro,
  })
  findOne(
    @Param('id_usuario', ParseIntPipe) id_usuario: number,
    @Param('id_logro', ParseIntPipe) id_logro: number,
  ): Promise<UsuarioLogro> {
    // ParseIntPipe valida ambos componentes de la clave antes de consultar.
    // Los guards del método autorizan la lectura solo a administradores autenticados.
    return this.usuarioLogroService.findOne(id_usuario, id_logro);
  }
}
