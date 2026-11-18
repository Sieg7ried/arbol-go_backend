import {
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { Historial } from '../../historial/entities/historial.entity';
import { Role } from '../enums/role.enum';
import { OwnershipGuard } from './ownership.guard';

describe('OwnershipGuard', () => {
  // Configura el metadato, el query builder y el usuario que representará cada solicitud.
  function prepararGuard(
    ownerId: number,
    authenticatedUser: { id_usuario: number; role: string; rol: string },
    resource = 'publicacion',
  ) {
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ ownerId }),
    };
    const dataSourceMock = {
      getRepository: jest.fn(() => ({
        createQueryBuilder: jest.fn(() => queryBuilder),
      })),
    };
    const reflectorMock = {
      getAllAndOverride: jest.fn().mockReturnValue(resource),
    };
    const request = {
      params: { id: '17' },
      user: authenticatedUser,
    };
    const contextMock = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(() => ({
        getRequest: jest.fn(() => request),
      })),
    };

    // Inyecta mocks para aislar la autorización de Nest y de la base de datos real.
    const guard = new OwnershipGuard(
      reflectorMock as unknown as Reflector,
      dataSourceMock as unknown as DataSource,
    );

    return {
      guard,
      context: contextMock as unknown as ExecutionContext,
      dataSourceMock,
    };
  }

  it('permite al usuario autenticado que coincide con el propietario', async () => {
    // Arrange: el ID persistido del dueño coincide con el usuario no administrador.
    const { guard, context } = prepararGuard(7, {
      id_usuario: 7,
      role: Role.USER,
      rol: Role.USER,
    });

    // Act: ejecuta la comprobación de propiedad.
    const permitido = await guard.canActivate(context);

    // Assert: el propietario puede continuar con la operación.
    expect(permitido).toBe(true);
  });

  it('permite a un administrador acceder a un recurso ajeno existente', async () => {
    // Arrange: el recurso existe y el rol administrativo es distinto de su propietario.
    const { guard, context } = prepararGuard(7, {
      id_usuario: 99,
      role: Role.ADMIN,
      rol: Role.ADMIN,
    });

    // Act: ejecuta el guard con el rol de administrador.
    const permitido = await guard.canActivate(context);

    // Assert: la política administrativa permite moderar recursos ajenos.
    expect(permitido).toBe(true);
  });

  it('bloquea a otro usuario con ForbiddenException', async () => {
    // Arrange: el dueño persistido no coincide con el usuario autenticado.
    const { guard, context } = prepararGuard(7, {
      id_usuario: 8,
      role: Role.USER,
      rol: Role.USER,
    });

    // Act & Assert: rechaza el acceso horizontal de un usuario no propietario.
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('resuelve la propiedad del historial mediante su árbol asociado', async () => {
    // Arrange: el mock representa un historial cuyo árbol pertenece a otro usuario.
    const { guard, context, dataSourceMock } = prepararGuard(
      7,
      { id_usuario: 8, role: Role.USER, rol: Role.USER },
      'historial',
    );

    // Act & Assert: valida que el guard consulte la entidad Historial y responda 403.
    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(dataSourceMock.getRepository).toHaveBeenCalledWith(Historial);
  });
});
