// Importa las excepciones y contratos necesarios para bloquear acceso horizontal.
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa Reflector para leer el recurso declarado con @OwnsResource.
import { Reflector } from '@nestjs/core';

// Importa DataSource para consultar al propietario persistido, sin confiar en el body.
import { DataSource } from 'typeorm';

// Importa las entidades protegidas y sus relaciones de propiedad.
import { Arbol } from '../../arbol/entities/arbol.entity';
import { Cuidado } from '../../cuidado/entities/cuidado.entity';
import { Fotografia } from '../../fotografia/entities/fotografia.entity';
import { Recordatorio } from '../../recordatorio/entities/recordatorio.entity';
import { Publicacion } from '../../publicacion/entities/publicacion.entity';
import { Comentario } from '../../comentario/entities/comentario.entity';
import {
  OWNERSHIP_RESOURCE_KEY,
  OwnershipResource,
} from '../decorators/owns-resource.decorator';
import { Role } from '../enums/role.enum';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface';

// Valida propiedad persistida y permite explícitamente la moderación administrativa.
@Injectable()
export class OwnershipGuard implements CanActivate {
  // Configura el lector de metadatos y la conexión para consultar propiedad real.
  constructor(
    // Lee el recurso configurado en el método del controlador.
    private readonly reflector: Reflector,

    // Consulta la relación de propiedad directamente en la base de datos.
    private readonly dataSource: DataSource,
  ) {}

  // Comprueba autenticación y propiedad antes de permitir modificaciones o borrados.
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obtiene el recurso declarado y los datos ya validados por JwtAuthGuard.
    const resource = this.reflector.getAllAndOverride<
      OwnershipResource | undefined
    >(OWNERSHIP_RESOURCE_KEY, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<{
      params: { id: string };
      user?: AuthenticatedUser;
    }>();

    // Rechaza una configuración incompleta en vez de permitir acceso accidental.
    if (!resource) {
      throw new ForbiddenException('Recurso sin configuración de propiedad');
    }

    // Rechaza requests que no pasaron autenticación.
    if (!request.user) {
      throw new ForbiddenException('Usuario autenticado requerido');
    }

    // Convierte el identificador de ruta y rechaza valores no numéricos.
    const resourceId = Number(request.params.id);
    if (!Number.isInteger(resourceId) || resourceId <= 0) {
      throw new ForbiddenException('Identificador de recurso inválido');
    }

    // Consulta el dueño persistido, sin confiar en id_usuario enviado por el cliente.
    const ownerId = await this.findOwnerId(resource, resourceId);

    // Evita revelar o modificar recursos inexistentes.
    if (ownerId === null) {
      throw new NotFoundException('Recurso no encontrado');
    }

    // Permite moderación administrativa solo después de comprobar autenticación y existencia.
    const role = request.user.role ?? request.user.rol;
    if (role === Role.ADMIN) {
      return true;
    }

    // Previene IDOR: cualquier otro usuario solo puede acceder a sus recursos propios.
    if (ownerId !== request.user.id_usuario) {
      throw new ForbiddenException('No tienes permisos sobre este recurso');
    }

    // Permite la ejecución solo después de comprobar propiedad exacta.
    return true;
  }

  // Resuelve el propietario según la relación específica de cada entidad.
  private async findOwnerId(
    resource: OwnershipResource,
    id: number,
  ): Promise<number | null> {
    // Consulta cada entidad con una relación explícita para conservar seguridad y tipos.
    switch (resource) {
      case 'arbol':
        return this.findArbolOwner(id);
      case 'cuidado':
        return this.findTreeRelationOwner(Cuidado, 'id_cuidado', id);
      case 'fotografia':
        return this.findTreeRelationOwner(Fotografia, 'id_foto', id);
      case 'recordatorio':
        return this.findTreeRelationOwner(Recordatorio, 'id_recordatorio', id);
      case 'publicacion':
        return this.findUserRelationOwner(Publicacion, 'id_publicacion', id);
      case 'comentario':
        return this.findUserRelationOwner(Comentario, 'id_comentario', id);
    }
  }

  // Obtiene el propietario directo de un árbol.
  private async findArbolOwner(id: number): Promise<number | null> {
    // Consulta el árbol y su usuario propietario en la base de datos.
    const row = await this.dataSource
      .getRepository(Arbol)
      .createQueryBuilder('arbol')
      .innerJoin('arbol.usuario', 'usuario')
      .select('usuario.id', 'ownerId')
      .where('arbol.id_arbol = :id', { id })
      .getRawOne<{ ownerId: number }>();

    // Devuelve null si el recurso no existe.
    return row?.ownerId ?? null;
  }

  // Obtiene el propietario de recursos que pertenecen indirectamente a un árbol.
  private async findTreeRelationOwner(
    entity: typeof Cuidado | typeof Fotografia | typeof Recordatorio,
    primaryKey: string,
    id: number,
  ): Promise<number | null> {
    // La relación arbol.usuario determina el dueño efectivo del recurso.
    const row = await this.dataSource
      .getRepository(entity)
      .createQueryBuilder('resource')
      .innerJoin('resource.arbol', 'arbol')
      .innerJoin('arbol.usuario', 'usuario')
      .select('usuario.id', 'ownerId')
      .where(`resource.${primaryKey} = :id`, { id })
      .getRawOne<{ ownerId: number }>();

    // Devuelve null si no existe el recurso o su relación.
    return row?.ownerId ?? null;
  }

  // Obtiene el propietario de publicaciones y comentarios mediante usuario directo.
  private async findUserRelationOwner(
    entity: typeof Publicacion | typeof Comentario,
    primaryKey: string,
    id: number,
  ): Promise<number | null> {
    // La relación resource.usuario contiene el dueño persistido.
    const row = await this.dataSource
      .getRepository(entity)
      .createQueryBuilder('resource')
      .innerJoin('resource.usuario', 'usuario')
      .select('usuario.id', 'ownerId')
      .where(`resource.${primaryKey} = :id`, { id })
      .getRawOne<{ ownerId: number }>();

    // Devuelve null si el recurso no existe.
    return row?.ownerId ?? null;
  }
}
