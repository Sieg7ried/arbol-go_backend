import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../user/entities/user.entity';

interface ExampleResponse {
  message: string;
  user: User;
}

@Controller('example')
export class ExampleController {
  // Ruta protegida solo con autenticación
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  protectedRoute(@GetUser() user: User): ExampleResponse {
    return {
      message: 'Esta ruta está protegida',
      user,
    };
  }

  // Ruta protegida solo para administradores
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin')
  adminRoute(@GetUser() user: User): ExampleResponse {
    return {
      message: 'Esta ruta es solo para administradores',
      user,
    };
  }
}