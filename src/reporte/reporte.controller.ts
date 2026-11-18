// Importa decoradores HTTP para exponer la cola administrativa de reportes.
import { Controller, Get, UseGuards } from '@nestjs/common';

// Importa decoradores de OpenAPI para documentar autenticación y respuestas.
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

// Importa los guards que autentican y autorizan a administradores.
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

// Importa la entidad de respuesta y el servicio de moderación.
import { Reporte } from './entities/reporte.entity';
import { ReporteService } from './reporte.service';

// Agrupa las rutas de revisión de reportes bajo /reportes.
@Controller('reportes')
@ApiTags('Reportes')
@ApiBearerAuth('access-token')
export class ReporteController {
  // Inyecta el servicio que consulta reportes y sus relaciones.
  constructor(private readonly reporteService: ReporteService) {}

  // Restringe toda la cola de reportes a usuarios ADMIN autenticados.
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  @ApiOperation({ summary: 'Listar reportes para moderación administrativa' })
  @ApiResponse({
    status: 200,
    description: 'Reportes con motivo, reportante y contenido asociado.',
    type: Reporte,
    isArray: true,
  })
  // Devuelve los reportes para que un administrador pueda revisar su contexto.
  listar(): Promise<Reporte[]> {
    return this.reporteService.listarParaModeracion();
  }
}
