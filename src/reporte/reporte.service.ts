// Importa excepciones para conflictos y objetivos inexistentes.
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// DataSource permite ejecutar el alta, conteo y ocultamiento en una transacción.
import { DataSource } from 'typeorm';

// Importa las entidades que participan en el reporte.
import { Comentario } from '../comentario/entities/comentario.entity';
import { Publicacion } from '../publicacion/entities/publicacion.entity';
import { Reporte } from './entities/reporte.entity';

// Centraliza el registro de reportes y la aplicación del umbral de moderación.
@Injectable()
export class ReporteService {
  // Un contenido se oculta al alcanzar tres reportes de usuarios distintos.
  private readonly umbralOcultamiento = 3;

  // Inyecta TypeORM para usar repositorios transaccionales y consultar la cola administrativa.
  constructor(private readonly dataSource: DataSource) {}

  // Registra un reporte de publicación y oculta el contenido al alcanzar el umbral.
  async reportarPublicacion(
    publicacionId: number,
    usuarioId: number,
    motivo: string,
  ): Promise<Reporte> {
    // Ejecuta el bloqueo, la inserción, el conteo y el cambio de estado atómicamente.
    return this.dataSource.transaction(async (manager) => {
      // Bloquea la publicación para serializar reportes simultáneos sobre el mismo objetivo.
      const publicacion = await manager.getRepository(Publicacion).findOne({
        where: { id_publicacion: publicacionId },
        lock: { mode: 'pessimistic_write' },
      });

      // Rechaza reportes asociados a una publicación inexistente.
      if (!publicacion) {
        throw new NotFoundException('Publicación no encontrada');
      }

      // Evita aumentar el conteo cuando la publicación ya está en revisión.
      if (publicacion.estado_moderacion === 'oculto') {
        throw new ConflictException('La publicación ya está en revisión');
      }

      // Comprueba duplicados para devolver un error claro antes de insertar.
      const existente = await manager.getRepository(Reporte).findOneBy({
        id_usuario: usuarioId,
        id_publicacion: publicacionId,
      });

      // La restricción UNIQUE en la base de datos conserva esta garantía ante concurrencia.
      if (existente) {
        throw new ConflictException('Ya reportaste esta publicación');
      }

      // Construye el reporte con el usuario autenticado y solo una publicación objetivo.
      const reporte = manager.getRepository(Reporte).create({
        id_usuario: usuarioId,
        id_publicacion: publicacionId,
        id_comentario: null,
        motivo,
      });

      // Persiste el reporte dentro de la transacción antes de contar el total.
      await manager.getRepository(Reporte).save(reporte);

      // Cuenta los reportes únicos registrados para esta publicación.
      const totalReportes = await manager
        .getRepository(Reporte)
        .countBy({ id_publicacion: publicacionId });

      // Cambia a oculto únicamente cuando el número alcanza el umbral configurado.
      if (totalReportes >= this.umbralOcultamiento) {
        publicacion.estado_moderacion = 'oculto';
        await manager.getRepository(Publicacion).save(publicacion);
      }

      // Devuelve el reporte persistido para confirmar la operación.
      return reporte;
    });
  }

  // Registra un reporte de comentario y oculta el contenido al alcanzar el umbral.
  async reportarComentario(
    comentarioId: number,
    usuarioId: number,
    motivo: string,
  ): Promise<Reporte> {
    // Mantiene el alta del reporte y el cambio de estado en una sola transacción.
    return this.dataSource.transaction(async (manager) => {
      // Bloquea el comentario para serializar reportes simultáneos sobre el mismo objetivo.
      const comentario = await manager.getRepository(Comentario).findOne({
        where: { id_comentario: comentarioId },
        lock: { mode: 'pessimistic_write' },
      });

      // Rechaza reportes asociados a un comentario inexistente.
      if (!comentario) {
        throw new NotFoundException('Comentario no encontrado');
      }

      // Evita seguir acumulando reportes cuando el comentario ya está oculto.
      if (comentario.estado_moderacion === 'oculto') {
        throw new ConflictException('El comentario ya está en revisión');
      }

      // Comprueba duplicados antes del insert para producir un conflicto legible.
      const existente = await manager.getRepository(Reporte).findOneBy({
        id_usuario: usuarioId,
        id_comentario: comentarioId,
      });

      // La restricción UNIQUE es una segunda barrera ante solicitudes concurrentes.
      if (existente) {
        throw new ConflictException('Ya reportaste este comentario');
      }

      // Construye el reporte con el usuario autenticado y solo un comentario objetivo.
      const reporte = manager.getRepository(Reporte).create({
        id_usuario: usuarioId,
        id_publicacion: null,
        id_comentario: comentarioId,
        motivo,
      });

      // Persiste el reporte antes de calcular el umbral.
      await manager.getRepository(Reporte).save(reporte);

      // Cuenta los reportes únicos asociados a este comentario.
      const totalReportes = await manager
        .getRepository(Reporte)
        .countBy({ id_comentario: comentarioId });

      // Oculta el comentario automáticamente cuando alcanza el umbral.
      if (totalReportes >= this.umbralOcultamiento) {
        comentario.estado_moderacion = 'oculto';
        await manager.getRepository(Comentario).save(comentario);
      }

      // Devuelve el reporte para confirmación y auditoría.
      return reporte;
    });
  }

  // Devuelve reportes y relaciones para que administradores revisen motivo y autor.
  async listarParaModeracion(): Promise<Reporte[]> {
    // Ordena los más recientes primero y carga las relaciones necesarias para revisar.
    return this.dataSource.getRepository(Reporte).find({
      relations: {
        usuario: true,
        publicacion: true,
        comentario: true,
      },
      order: { fecha_reporte: 'DESC' },
    });
  }
}
