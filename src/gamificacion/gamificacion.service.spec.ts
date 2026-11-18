import { Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EstadoCuidadoEnum } from '../common/enums/estado-cuidado.enum';
import { Cuidado } from '../cuidado/entities/cuidado.entity';
import { User } from '../user/entities/user.entity';
import { GamificacionService } from './gamificacion.service';

describe('GamificacionService', () => {
  // Configura repositorios simulados y un manager que los entrega por clase de entidad.
  function crearManagerPrincipal(cuidado: Cuidado, usuario: User) {
    const cuidadoRepository = {
      findOne: jest.fn().mockResolvedValue(cuidado),
      save: jest.fn(async (entity) => entity),
    };
    const userRepository = {
      findOne: jest.fn().mockResolvedValue(usuario),
      save: jest.fn(async (entity) => entity),
    };
    const manager = {
      getRepository: jest.fn((entity: unknown) =>
        entity === Cuidado ? cuidadoRepository : userRepository,
      ),
    };

    return { manager, cuidadoRepository, userRepository };
  }

  it('suma exactamente 10 XP y 10 puntos una sola vez', async () => {
    // Arrange: configura cuidado completado sin recompensa y un usuario con valores iniciales conocidos.
    const usuario = Object.assign(new User(), {
      id: 8,
      experiencia: 25,
      puntos: 4,
      nivel: 1,
    });
    const cuidado = Object.assign(new Cuidado(), {
      id_cuidado: 12,
      estado: EstadoCuidadoEnum.COMPLETADO,
      recompensado: false,
      arbol: { usuario: { id: usuario.id } },
    });
    const { manager, cuidadoRepository, userRepository } =
      crearManagerPrincipal(cuidado, usuario);
    const service = new GamificacionService(
      { transaction: jest.fn() } as unknown as DataSource,
    );

    // Act: procesa la recompensa y simula un reintento sobre el mismo cuidado.
    const primeraRespuesta = await service.procesarCuidadoCompletado(
      manager as unknown as EntityManager,
      cuidado.id_cuidado,
    );
    const segundoResultado = await service.procesarCuidadoCompletado(
      manager as unknown as EntityManager,
      cuidado.id_cuidado,
    );

    // Assert: XP y puntos aumentan una sola vez, y el indicador impide un segundo guardado.
    expect(primeraRespuesta).toMatchObject({ usuarioId: usuario.id });
    expect(segundoResultado).toBeNull();
    expect(usuario.experiencia).toBe(35);
    expect(usuario.puntos).toBe(14);
    expect(cuidado.recompensado).toBe(true);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
    expect(cuidadoRepository.save).toHaveBeenCalledTimes(1);
  });

  it('no vuelve a premiar un cuidado que ya tiene la marca persistida', async () => {
    // Arrange: representa un cuidado completado cuya recompensa fue acreditada antes.
    const usuario = Object.assign(new User(), {
      id: 9,
      experiencia: 80,
      puntos: 30,
      nivel: 1,
    });
    const cuidado = Object.assign(new Cuidado(), {
      id_cuidado: 13,
      estado: EstadoCuidadoEnum.COMPLETADO,
      recompensado: true,
      arbol: { usuario: { id: usuario.id } },
    });
    const { manager, cuidadoRepository, userRepository } =
      crearManagerPrincipal(cuidado, usuario);
    const service = new GamificacionService(
      { transaction: jest.fn() } as unknown as DataSource,
    );

    // Act: vuelve a invocar la operación protegida por el indicador idempotente.
    const resultado = await service.procesarCuidadoCompletado(
      manager as unknown as EntityManager,
      cuidado.id_cuidado,
    );

    // Assert: retorna sin consultar ni modificar el progreso del usuario.
    expect(resultado).toBeNull();
    expect(usuario.experiencia).toBe(80);
    expect(usuario.puntos).toBe(30);
    expect(cuidadoRepository.save).not.toHaveBeenCalled();
    expect(userRepository.findOne).not.toHaveBeenCalled();
    expect(userRepository.save).not.toHaveBeenCalled();
  });

  it('no revierte XP/puntos si el logro opcional no existe en el catálogo', async () => {
    // Arrange: crea repositorios principales para la recompensa garantizada del cuidado.
    const usuario = Object.assign(new User(), {
      id: 10,
      experiencia: 0,
      puntos: 0,
      nivel: 1,
    });
    const cuidado = Object.assign(new Cuidado(), {
      id_cuidado: 14,
      estado: EstadoCuidadoEnum.COMPLETADO,
      recompensado: false,
      arbol: { usuario: { id: usuario.id } },
    });
    const principal = crearManagerPrincipal(cuidado, usuario);

    // Arrange: configura el QueryBuilder de cuidados y un catálogo sin FIRST_CARE.
    const queryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(1),
    };
    const cuidadoLogroRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    const logroRepository = {
      findOneBy: jest.fn().mockResolvedValue(null),
    };
    const managerLogros = {
      getRepository: jest.fn((entity: unknown) =>
        entity === Cuidado ? cuidadoLogroRepository : logroRepository,
      ),
    };

    // Arrange: la transacción simulada ejecuta el callback con el manager de logros.
    const dataSourceMock = {
      transaction: jest.fn(async (callback) =>
        callback(managerLogros as unknown as EntityManager),
      ),
    };
    const loggerWarning = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    const service = new GamificacionService(
      dataSourceMock as unknown as DataSource,
    );

    // Act: acredita la recompensa principal y luego intenta procesar el logro ausente.
    const resultado = await service.procesarCuidadoCompletado(
      principal.manager as unknown as EntityManager,
      cuidado.id_cuidado,
    );

    if (!resultado) {
      throw new Error('Se esperaba el resultado de la recompensa principal');
    }

    await service.procesarLogrosDeCuidado(resultado);

    // Assert: la ausencia de catálogo se registra, pero no revierte ni rechaza XP/puntos.
    expect(usuario.experiencia).toBe(10);
    expect(usuario.puntos).toBe(10);
    expect(principal.userRepository.save).toHaveBeenCalledTimes(1);
    expect(logroRepository.findOneBy).toHaveBeenCalledWith({
      codigo: 'FIRST_CARE',
    });
    expect(loggerWarning).toHaveBeenCalled();

    loggerWarning.mockRestore();
  });
});
