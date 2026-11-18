import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Comentario } from '../comentario/entities/comentario.entity';
import { Publicacion } from '../publicacion/entities/publicacion.entity';
import { Reporte } from './entities/reporte.entity';
import { ReporteService } from './reporte.service';

describe('ReporteService', () => {
  function crearServicio(totalReportes: number, reporteExistente = null) {
    const publicacion = Object.assign(new Publicacion(), {
      id_publicacion: 7,
      estado_moderacion: 'visible',
    });
    const reportes = {
      findOneBy: jest.fn().mockResolvedValue(reporteExistente),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      countBy: jest.fn().mockResolvedValue(totalReportes),
    };
    const publicaciones = {
      findOne: jest.fn().mockResolvedValue(publicacion),
      save: jest.fn(async (value) => value),
    };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === Publicacion ? publicaciones : reportes,
      ),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };

    return {
      service: new ReporteService(dataSource as unknown as DataSource),
      publicacion,
      reportes,
      publicaciones,
    };
  }

  it('oculta la publicación cuando el reporte alcanza el umbral de tres', async () => {
    const { service, publicacion, reportes, publicaciones } =
      crearServicio(3);

    await service.reportarPublicacion(7, 12, 'Contenido engañoso');

    expect(reportes.save).toHaveBeenCalledTimes(1);
    expect(reportes.countBy).toHaveBeenCalledWith({ id_publicacion: 7 });
    expect(publicacion.estado_moderacion).toBe('oculto');
    expect(publicaciones.save).toHaveBeenCalledWith(publicacion);
  });

  it('rechaza un segundo reporte del mismo usuario para la publicación', async () => {
    const { service, reportes, publicaciones } = crearServicio(
      1,
      new Reporte(),
    );

    await expect(
      service.reportarPublicacion(7, 12, 'Contenido engañoso'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(reportes.save).not.toHaveBeenCalled();
    expect(reportes.countBy).not.toHaveBeenCalled();
    expect(publicaciones.save).not.toHaveBeenCalled();
  });

  it('oculta el comentario cuando alcanza el umbral de tres reportes', async () => {
    const comentario = Object.assign(new Comentario(), {
      id_comentario: 9,
      estado_moderacion: 'visible',
    });
    const reportes = {
      findOneBy: jest.fn().mockResolvedValue(null),
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      countBy: jest.fn().mockResolvedValue(3),
    };
    const comentarios = {
      findOne: jest.fn().mockResolvedValue(comentario),
      save: jest.fn(async (value) => value),
    };
    const manager = {
      getRepository: jest.fn((entity) =>
        entity === Comentario ? comentarios : reportes,
      ),
    };
    const dataSource = {
      transaction: jest.fn((callback) => callback(manager)),
    };
    const service = new ReporteService(dataSource as unknown as DataSource);

    await service.reportarComentario(9, 12, 'Contenido ofensivo');

    expect(reportes.countBy).toHaveBeenCalledWith({ id_comentario: 9 });
    expect(comentario.estado_moderacion).toBe('oculto');
    expect(comentarios.save).toHaveBeenCalledWith(comentario);
  });
});
