// Importa excepciones para errores de la recompensa principal y Logger para fallos opcionales.
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

// Importa el origen de datos para transacciones independientes de logros y su administrador.
import { DataSource, EntityManager } from 'typeorm';

// Importa las entidades utilizadas por las reglas de gamificación.
import { Cuidado } from '../cuidado/entities/cuidado.entity';
import { Logro } from '../logro/entities/logro.entity';
import { User } from '../user/entities/user.entity';
import { UsuarioLogro } from '../usuario-logro/entities/usuario-logro.entity';

// Contiene los datos mínimos para procesar logros después de confirmar XP/puntos del cuidado.
export interface ResultadoRecompensaCuidado {
  // Usuario al que ya se le acreditó la recompensa principal.
  usuarioId: number;
  // Nivel previo necesario para detectar un ascenso.
  nivelAnterior: number;
  // Nivel persistido después de acreditar experiencia.
  nivelActual: number;
}

// Centraliza las recompensas, la progresión de nivel y los logros automáticos.
@Injectable()
export class GamificacionService {
  // Registra los fallos de logros opcionales sin ocultar problemas de la recompensa principal.
  private readonly logger = new Logger(GamificacionService.name);

  // Define la experiencia otorgada por cada cuidado completado.
  private readonly xpPorCuidado = 10;

  // Define los puntos otorgados por cada cuidado completado.
  private readonly puntosPorCuidado = 10;

  // Define el estado que representa un cuidado finalizado.
  private readonly estadoCompletado = 'completado';

  // Inyecta el origen de datos para aislar las asignaciones opcionales de logros.
  constructor(private readonly dataSource: DataSource) {}

  // Acredita XP/puntos base dentro de la transacción que completa el cuidado.
  async procesarCuidadoCompletado(
    manager: EntityManager,
    cuidadoId: number,
  ): Promise<ResultadoRecompensaCuidado | null> {
    // Bloquea la fila para que reintentos concurrentes no procesen el mismo cuidado a la vez.
    const cuidado = await manager.getRepository(Cuidado).findOne({
      where: { id_cuidado: cuidadoId },
      relations: {
        arbol: {
          usuario: true,
        },
      },
      lock: { mode: 'pessimistic_write' },
    });

    // Informa si el cuidado fue eliminado antes de procesar la recompensa.
    if (!cuidado) {
      throw new NotFoundException(`Cuidado con ID ${cuidadoId} no encontrado`);
    }

    // La recompensa principal solo se acredita si el estado persistido es completado.
    if (cuidado.estado.trim().toLowerCase() !== this.estadoCompletado) {
      throw new ConflictException(
        'Solo se puede recompensar un cuidado completado',
      );
    }

    // El indicador persistido hace idempotente el premio principal ante llamadas repetidas.
    if (cuidado.recompensado) {
      return null;
    }

    // Marca la recompensa dentro de la transacción principal para evitar duplicados.
    cuidado.recompensado = true;
    await manager.getRepository(Cuidado).save(cuidado);

    // Obtiene el usuario desde el árbol persistido, nunca desde datos del cliente.
    const usuarioId = cuidado.arbol?.usuario?.id;

    // Falla la transacción principal si no se puede atribuir correctamente su recompensa.
    if (!usuarioId) {
      throw new NotFoundException(
        `No se pudo determinar el propietario del cuidado ${cuidadoId}`,
      );
    }

    // Bloquea al usuario para serializar actualizaciones concurrentes de su progresión.
    const usuario = await manager.getRepository(User).findOne({
      where: { id: usuarioId },
      lock: { mode: 'pessimistic_write' },
    });

    // Evita guardar progreso si el propietario ya no existe.
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Guarda el nivel previo para detectar si se alcanzó un nivel nuevo.
    const nivelAnterior = usuario.nivel;

    // Acredita la recompensa base garantizada del cuidado completado.
    usuario.experiencia += this.xpPorCuidado;
    usuario.puntos += this.puntosPorCuidado;

    // Calcula el nivel a partir de la experiencia acumulada.
    usuario.nivel = Math.floor(usuario.experiencia / 100) + 1;

    // Persiste XP, puntos y nivel dentro de la misma transacción del cuidado.
    await manager.getRepository(User).save(usuario);

    // Devuelve el contexto para buscar logros solo después del commit de la recompensa principal.
    return {
      usuarioId,
      nivelAnterior,
      nivelActual: usuario.nivel,
    };
  }

  // Procesa los logros en una transacción independiente de cuidado y experiencia.
  async procesarLogrosDeCuidado(
    resultado: ResultadoRecompensaCuidado,
  ): Promise<void> {
    try {
      // Un fallo de catálogo revierte solo esta transacción secundaria, nunca la recompensa principal.
      await this.dataSource.transaction(async (manager: EntityManager) => {
        // Evalúa el logro de primera actividad completada.
        await this.desbloquearPrimerCuidado(manager, resultado.usuarioId);

        // Evalúa el logro de nivel solo cuando la recompensa elevó el nivel del usuario.
        if (resultado.nivelActual > resultado.nivelAnterior) {
          await this.desbloquearLogroDeNivel(
            manager,
            resultado.usuarioId,
            resultado.nivelActual,
          );
        }
      });
    } catch (error) {
      // Logra visibilidad operativa del fallo sin afectar cuidado, XP ni puntos base ya confirmados.
      this.logger.warn(
        `No se pudieron procesar los logros del usuario ${resultado.usuarioId}: ${this.obtenerMensajeError(error)}`,
      );
    }
  }

  // Desbloquea FIRST_CARE si la actividad actual es la primera completada por el usuario.
  private async desbloquearPrimerCuidado(
    manager: EntityManager,
    usuarioId: number,
  ): Promise<void> {
    // Cuenta las actividades completadas pertenecientes al usuario.
    const cuidadosCompletados = await manager
      .getRepository(Cuidado)
      .createQueryBuilder('cuidado')
      .innerJoin('cuidado.arbol', 'arbol')
      .innerJoin('arbol.usuario', 'usuario')
      .where('usuario.id = :usuarioId', { usuarioId })
      .andWhere('cuidado.estado = :estado', {
        estado: this.estadoCompletado,
      })
      .getCount();

    // Solo el primer cuidado completado cumple esta condición.
    if (cuidadosCompletados !== 1) {
      return;
    }

    // Consulta por código estable, no por el texto visible o traducible.
    const logro = await this.obtenerLogroPorCodigo(manager, 'FIRST_CARE');

    // La ausencia o fallo de búsqueda devuelve null y omite únicamente este logro.
    if (logro) {
      await this.registrarLogroSiNoExiste(manager, usuarioId, logro);
    }
  }

  // Desbloquea el logro cuyo código corresponde al nivel alcanzado.
  private async desbloquearLogroDeNivel(
    manager: EntityManager,
    usuarioId: number,
    nivel: number,
  ): Promise<void> {
    // Usa el nivel en el código lógico para no depender de nombres del catálogo.
    const codigo = `LEVEL_${nivel}`;

    // Consulta por código estable, independientemente de la etiqueta visible del logro.
    const logro = await this.obtenerLogroPorCodigo(manager, codigo);

    // Si el logro no está configurado, se omite su asignación sin error fatal.
    if (logro) {
      await this.registrarLogroSiNoExiste(manager, usuarioId, logro);
    }
  }

  // Busca por código y devuelve null con advertencia si falta el registro o falla la consulta.
  private async obtenerLogroPorCodigo(
    manager: EntityManager,
    codigo: string,
  ): Promise<Logro | null> {
    try {
      // El código único evita depender de nombres localizados o editables.
      const logro = await manager.getRepository(Logro).findOneBy({ codigo });

      // Informa una configuración incompleta y permite continuar sin otorgar este logro.
      if (!logro) {
        this.logger.warn(
          `No existe el logro con código ${codigo}; se omite su asignación.`,
        );
      }

      return logro;
    } catch (error) {
      // Absorbe fallos de consulta porque los logros no son requisito para acreditar XP/puntos.
      this.logger.warn(
        `Falló la búsqueda del logro ${codigo}; se omite: ${this.obtenerMensajeError(error)}`,
      );
      return null;
    }
  }

  // Registra un logro y suma sus puntos una sola vez dentro de la transacción secundaria.
  private async registrarLogroSiNoExiste(
    manager: EntityManager,
    usuarioId: number,
    logro: Logro,
  ): Promise<void> {
    // Comprueba la clave compuesta para evitar asignar el mismo logro más de una vez.
    const existente = await manager.getRepository(UsuarioLogro).findOneBy({
      id_usuario: usuarioId,
      id_logro: logro.id,
    });

    // Un logro ya asignado no vuelve a sumar puntos.
    if (existente) {
      return;
    }

    // Bloquea al usuario para que puntos de logros no se pierdan ante actualizaciones concurrentes.
    const usuario = await manager.getRepository(User).findOne({
      where: { id: usuarioId },
      lock: { mode: 'pessimistic_write' },
    });

    // La transacción secundaria se aborta si el usuario ya no existe.
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Suma los puntos configurados para el logro.
    usuario.puntos += logro.puntos_otorgados;
    await manager.getRepository(User).save(usuario);

    // Construye la relación con la fecha de obtención actual.
    const usuarioLogro = manager.getRepository(UsuarioLogro).create({
      id_usuario: usuarioId,
      id_logro: logro.id,
      fecha_obtenido: new Date(),
    });

    // Persiste la asignación dentro de la transacción secundaria.
    await manager.getRepository(UsuarioLogro).save(usuarioLogro);
  }

  // Convierte el fallo a texto seguro para Logger sin propagarlo a la transacción principal.
  private obtenerMensajeError(error: unknown): string {
    return error instanceof Error ? error.message : 'error desconocido';
  }
}
