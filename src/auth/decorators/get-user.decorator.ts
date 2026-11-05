import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

/**
 * Decorador personalizado para extraer el usuario del request
 * (el usuario lo asigna JwtStrategy.validate())
 * Uso: @GetUser() user: AuthenticatedUser
 */
export const GetUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser | number | string => {
    // Obtiene el usuario que JwtStrategy colocó tras verificar la firma del token.
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();

    // Permite extraer el usuario completo o solo id_usuario/rol de forma uniforme.
    return data ? request.user[data] : request.user;
  },
);