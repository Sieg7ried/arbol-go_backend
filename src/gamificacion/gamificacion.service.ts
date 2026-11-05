// Importa las excepciones necesarias para informar configuraciones o relaciones inexistentes.
import { Injectable, NotFoundException } from '@nestjs/common';

// Importa el administrador que permite ejecutar todas las operaciones en una transacción.
import { EntityManager } from 'typeorm';

// Importa las entidades utilizadas por las reglas de gamificación.
import { Cuidado } from '../cuidado/entities/cuidado.entity';
import { Logro } from '../logro/entities/logro.entity';
import { User } from '../user/entities/user.entity';
import { UsuarioLogro } from '../usuario-logro/entities/usuario-logro.entity';

// Centraliza las recompensas, la progresión de nivel y los logros automáticos.
@Injectable()
export class GamificacionService {
  // Define la experiencia otorgada por cada cuidado completado.
  private readonly xpPorCuidado = 10;

  // Define los puntos otorgados por cada cuidado completado.
  private readonly puntosPorCuidado = 10;

  // Define el estado que representa un cuidado finalizado.
  private readonly estadoCompletado = 'completado';

  // Define el nombre del logro de la primera actividad completada.
  private readonly nombreLogroPrimerCuidado = 'Primer cuidado completado';

  // Procesa una recompensa dentro de la misma transacción que completa el cuidado.
  async procesarCuidadoCompletado(
    manager: EntityManager,
    cuidado: Cuidado,
  ): Promise<void> {
    // Obtiene el identificador del propietario desde el árbol relacionado.
    const usuarioId = cuidado.arbol?.usuario?.id;

    // Detiene explícitamente la operación si no se pudo resolver el propietario.
    if (!usuarioId) {
      throw new NotFoundException(
        `No se pudo determinar el propietario del cuidado ${cuidado.id_cuidado}`,
      );
    }

    // Bloquea al usuario para evitar acumulaciones duplicadas concurrentes.
    const usuario = await manager.getRepository(User).findOne({
      where: { id: usuarioId },
      lock: { mode: 'pessimistic_write' },
    });

    // Informa si el propietario ya no existe.
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Guarda el nivel anterior para desbloquear únicamente niveles recién alcanzados.
    const nivelAnterior = usuario.nivel;

    // Suma la experiencia y los puntos base del cuidado.
    usuario.experiencia += this.xpPorCuidado;
    usuario.puntos += this.puntosPorCuidado;

    // Fórmula escalable: nivel = piso(experiencia acumulada / 100) + 1.
    usuario.nivel = Math.floor(usuario.experiencia / 100) + 1;

    // Persiste de forma segura la nueva progresión del usuario.
    await manager.getRepository(User).save(usuario);

    // Evalúa el logro de primera actividad completada.
    await this.desbloquearPrimerCuidado(manager, usuarioId);

    // Evalúa el logro del nivel únicamente cuando se alcanzó un nivel nuevo.
    if (usuario.nivel > nivelAnterior) {
      await this.desbloquearLogroDeNivel(manager, usuario);
    }
  }

  // Desbloquea el logro del primer cuidado si la actividad actual es la primera.
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

    // Busca el logro configurado y lo registra de forma idempotente.
    const logro = await this.obtenerLogroPorNombre(
      manager,
      this.nombreLogroPrimerCuidado,
    );
    await this.registrarLogroSiNoExiste(manager, usuarioId, logro);
  }

  // Desbloquea el logro cuyo nombre corresponde al nivel alcanzado.
  private async desbloquearLogroDeNivel(
    manager: EntityManager,
    usuario: User,
  ): Promise<void> {
    // Construye el nombre convencional del logro de nivel.
    const nombreLogro = `Nivel ${usuario.nivel}`;

    // Busca el logro y evita duplicarlo para el usuario.
    const logro = await this.obtenerLogroPorNombre(manager, nombreLogro);
    await this.registrarLogroSiNoExiste(manager, usuario.id, logro);
  }

  // Busca un logro por nombre y falla si el catálogo no está configurado.
  private async obtenerLogroPorNombre(
    manager: EntityManager,
    nombre: string,
  ): Promise<Logro> {
    // Consulta el catálogo existente de logros.
    const logro = await manager.getRepository(Logro).findOneBy({ nombre });

    // Expone el error para evitar una recompensa incompleta o silenciosa.
    if (!logro) {
      throw new NotFoundException(
        `No existe el logro requerido "${nombre}" en el catálogo`,
      );
    }

    // Devuelve el logro validado.
    return logro;
  }

  // Registra un logro y suma sus puntos una sola vez.
  private async registrarLogroSiNoExiste(
    manager: EntityManager,
    usuarioId: number,
    logro: Logro,
  ): Promise<void> {
    // Comprueba la clave primaria compuesta antes de insertar.
    const existente = await manager.getRepository(UsuarioLogro).findOneBy({
      id_usuario: usuarioId,
      id_logro: logro.id,
    });

    // Evita duplicar el logro y sus puntos.
    if (existente) {
      return;
    }

    // Bloquea nuevamente al usuario para que la suma del logro sea segura.
    const usuario = await manager.getRepository(User).findOne({
      where: { id: usuarioId },
      lock: { mode: 'pessimistic_write' },
    });

    // Informa si el usuario desapareció durante la operación.
    if (!usuario) {
      throw new NotFoundException(`Usuario con ID ${usuarioId} no encontrado`);
    }

    // Suma los puntos configurados en el logro recién obtenido.
    usuario.puntos += logro.puntos_otorgados;
    await manager.getRepository(User).save(usuario);

    // Crea la relación con la fecha actual.
    const usuarioLogro = manager.getRepository(UsuarioLogro).create({
      id_usuario: usuarioId,
      id_logro: logro.id,
      fecha_obtenido: new Date(),
    });

    // Persiste la relación dentro de la misma transacción.
    await manager.getRepository(UsuarioLogro).save(usuarioLogro);
  }
}
