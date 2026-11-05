// Importa el decorador de módulo y Global para compartir guards en toda la aplicación.
import { Global, Module } from '@nestjs/common';

// Importa las piezas de autenticación que ya contienen JwtStrategy y RolesGuard.
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { OwnershipGuard } from './auth/guards/ownership.guard';

// Expone los guards de seguridad sin alterar los módulos CRUD existentes.
@Global()
@Module({
  // Reutiliza el módulo de autenticación existente.
  imports: [AuthModule],

  // Registra los guards que Nest resolverá mediante inyección de dependencias.
  providers: [JwtAuthGuard, RolesGuard, OwnershipGuard],

  // Permite usar los guards desde cualquier controlador de la aplicación.
  exports: [JwtAuthGuard, RolesGuard, OwnershipGuard],
})
export class SecurityModule {}
