import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { GetUser } from '../auth/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegistrarTokenDto } from './dto/registrar-token.dto';
import { NotificacionesService } from './notificaciones.service';

// Endpoints para asociar un dispositivo push únicamente al usuario autenticado.
@ApiTags('Notificaciones')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  // El usuario se extrae del JWT; no se acepta un ID de propietario en el body.
  @Post('device-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registrarToken(
    @GetUser('id_usuario') userId: number,
    @Body() dto: RegistrarTokenDto,
  ): Promise<void> {
    await this.notificacionesService.registrarToken(userId, dto.fcmToken);
  }

  // Permite al usuario retirar solamente el token vinculado a su propia cuenta.
  @Delete('device-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async retirarToken(@GetUser('id_usuario') userId: number): Promise<void> {
    await this.notificacionesService.retirarToken(userId);
  }
}
