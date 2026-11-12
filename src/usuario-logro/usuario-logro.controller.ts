import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UsuarioLogroService } from './usuario-logro.service';
import { UsuarioLogro } from './entities/usuario-logro.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

/**
 * Expone consultas administrativas de logros de usuarios.
 * Las asignaciones y cambios se gestionan desde servicios internos, no mediante HTTP.
 */
@Controller('usuario-logro')
@ApiTags('Logros de usuario')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsuarioLogroController {
  /** Servicio de relaciones, disponible también para los módulos internos del backend. */
  constructor(private readonly usuarioLogroService: UsuarioLogroService) {}

  /** Lista de relaciones accesible únicamente por un administrador autenticado. */
  @Get()
  @ApiOperation({ summary: 'Listar logros de usuarios (administrador)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de relaciones.',
    type: UsuarioLogro,
    isArray: true,
  })
  findAll(): Promise<UsuarioLogro[]> {
    // Los guards de clase evitan que usuarios anónimos o no administradores enumeren relaciones.
    return this.usuarioLogroService.findAll();
  }

  /** Consulta una relación existente y no crea ni modifica asignaciones. */
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
    // Los guards de clase autorizan la lectura solo a administradores autenticados.
    return this.usuarioLogroService.findOne(id_usuario, id_logro);
  }
}
