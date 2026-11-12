import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../user/dto/login.dto';
import { RegisterDto } from '../user/dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GetUser } from './decorators/get-user.decorator';
import { AuthResponse } from './interfaces/auth-response.interface';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface';

/** Endpoints públicos de autenticación y perfil privado del usuario autenticado. */
@Controller('auth')
export class AuthController {
  /** Inyecta la lógica de autenticación y lectura segura del perfil. */
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Registrar un nuevo usuario (responde 201 Created)
   */
  @Post('register')
  register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * POST /auth/login
   * Iniciar sesión (responde 200 OK, no se crea ningún recurso)
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  /**
   * GET /auth/profile
   * Permite a cualquier usuario con un JWT válido consultar su perfil y progreso.
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: AuthenticatedUser) {
    // El ID procede del JWT validado; el cliente no puede seleccionar otra cuenta.
    return this.authService.getProfile(user.id_usuario);
  }
}
