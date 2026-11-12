// Importa la excepción utilizada cuando no se encuentra un registro.
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { DataSource, EntityManager, Repository } from 'typeorm';

// Importa los DTO utilizados para crear y actualizar cuidados.
import { CreateCuidadoDto } from './dto/create-cuidado.dto';
import { UpdateCuidadoDto } from './dto/update-cuidado.dto';

// Importa el tipo de la entidad validada al crear un cuidado.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa la entidad principal del módulo.
import { Cuidado } from './entities/cuidado.entity';

// Importa el servicio que actualiza la progresión y los logros del propietario.
import { GamificacionService } from '../gamificacion/gamificacion.service';

// Importa el servicio que crea recordatorios para cuidados programados.
import { RecordatorioService } from '../recordatorio/recordatorio.service';

// Importa la utilidad de normalización UTC para fechas ISO recibidas.
import { parseUtcDate } from '../common/fecha.util';

// Declara el servicio que contiene la lógica de negocio de los cuidados.
@Injectable()
export class CuidadoService {
  // Configura los componentes necesarios para operar con cuidados y sus relaciones.
  constructor(
    // Inyecta el repositorio de cuidados.
    @InjectRepository(Cuidado)
    private readonly cuidadoRepository: Repository<Cuidado>,

    // Permite ejecutar el cambio de cuidado y la recompensa de forma atómica.
    private readonly dataSource: DataSource,

    // Procesa las recompensas cuando el cuidado se completa.
    private readonly gamificacionService: GamificacionService,

    // Crea recordatorios enlazados al árbol del cuidado.
    private readonly recordatorioService: RecordatorioService,
  ) {}

  // Crea un cuidado después de validar que exista el árbol relacionado.
  async create(createCuidadoDto: CreateCuidadoDto): Promise<Cuidado> {
    // Guarda cuidado y recordatorio atómicamente para que no quede un recurso parcialmente creado.
    return await this.dataSource.transaction(async (manager: EntityManager) => {
      // Valida el árbol usando el mismo manager que persiste ambos registros.
      const arbol: Arbol | null = await manager
        .getRepository(Arbol)
        .findOneBy({ id_arbol: createCuidadoDto.id_arbol });

      // Informa si el árbol relacionado no existe y revierte la transacción.
      if (!arbol) {
        throw new NotFoundException(
          `Árbol con ID ${createCuidadoDto.id_arbol} no encontrado`,
        );
      }

      // Separa la FK y las fechas para asignarlas con el formato correcto.
      const {
        id_arbol: _idArbol,
        fecha_programada,
        fecha_realizada,
        ...cuidadoData
      } = createCuidadoDto;

      // Crea una instancia de cuidado con la relación validada.
      const cuidado: Cuidado = manager.getRepository(Cuidado).create({
        ...cuidadoData,
        id_arbol: arbol.id_arbol,
        arbol,
        fecha_programada: parseUtcDate(fecha_programada),
        fecha_realizada: fecha_realizada ? parseUtcDate(fecha_realizada) : null,
        // Toda creación comienza sin recompensa; solo la transición válida la otorga.
        recompensado: false,
      });

      // Persiste el cuidado para obtener su clave antes de enlazar el recordatorio.
      const cuidadoGuardado = await manager
        .getRepository(Cuidado)
        .save(cuidado);

      // Guarda el recordatorio asociado dentro de la misma transacción.
      await this.recordatorioService.createForCuidado(cuidadoGuardado, manager);

      // Devuelve el cuidado confirmado junto con su recordatorio ya persistido.
      return cuidadoGuardado;
    });
  }

  // Obtiene todos los cuidados incluyendo el árbol relacionado.
  async findAll(): Promise<Cuidado[]> {
    // Consulta todos los cuidados junto con su árbol.
    return await this.cuidadoRepository.find({
      relations: {
        arbol: true,
      },
    });
  }

  // Obtiene un cuidado específico por su identificador.
  async findOne(id: number): Promise<Cuidado> {
    // Busca el cuidado por su clave primaria e incluye el árbol relacionado.
    const cuidado: Cuidado | null = await this.cuidadoRepository.findOne({
      where: { id_cuidado: id },
      relations: {
        arbol: {
          usuario: true,
        },
      },
    });

    // Informa si no existe un cuidado con el identificador recibido.
    if (!cuidado) {
      throw new NotFoundException(`Cuidado con ID ${id} no encontrado`);
    }

    // Devuelve el cuidado encontrado.
    return cuidado;
  }

  // Actualiza el cuidado y, al completarlo por primera vez, procesa la recompensa atómicamente.
  async update(
    id: number,
    updateCuidadoDto: UpdateCuidadoDto,
  ): Promise<Cuidado> {
    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateCuidadoDto.id_arbol !== undefined) {
      // Impide transferir el cuidado a un árbol que podría pertenecer a otro usuario.
      throw new ForbiddenException(
        'No puedes cambiar el árbol propietario del cuidado',
      );
    }

    // Confirma en una transacción el estado, el indicador idempotente y la recompensa principal.
    const resultado = await this.dataSource.transaction(
      async (manager: EntityManager) => {
        // El bloqueo pesimista serializa actualizaciones simultáneas del mismo cuidado.
        const cuidadoPersistido = await manager.getRepository(Cuidado).findOne({
          where: { id_cuidado: id },
          relations: {
            arbol: {
              usuario: true,
            },
          },
          lock: { mode: 'pessimistic_write' },
        });

        // Informa si el cuidado fue eliminado durante la actualización.
        if (!cuidadoPersistido) {
          throw new NotFoundException(`Cuidado con ID ${id} no encontrado`);
        }

        // Normaliza el estado persistido y el solicitado para evitar evadir la regla por mayúsculas.
        const estadoActual = cuidadoPersistido.estado.trim().toLowerCase();
        const estadoSolicitado =
          updateCuidadoDto.estado?.trim().toLowerCase() ?? estadoActual;

        // Una vez completado, el cuidado no puede volver a pendiente ni a ningún otro estado.
        if (
          estadoActual === 'completado' &&
          estadoSolicitado !== 'completado'
        ) {
          throw new ConflictException(
            'Un cuidado completado no puede cambiar a otro estado',
          );
        }

        // Solo una transición real desde un estado distinto puede disparar el procesamiento.
        const pasaACompletado =
          estadoActual !== 'completado' && estadoSolicitado === 'completado';

        // Copia el DTO para convertir fechas sin mutar el objeto validado original.
        const changes: Record<string, unknown> = {
          ...updateCuidadoDto,
        };

        // Convierte la fecha programada a una instancia de Date.
        if (updateCuidadoDto.fecha_programada !== undefined) {
          changes.fecha_programada = parseUtcDate(
            updateCuidadoDto.fecha_programada,
          );
        }

        // Convierte la fecha realizada a Date o null cuando corresponde.
        if (updateCuidadoDto.fecha_realizada !== undefined) {
          changes.fecha_realizada = updateCuidadoDto.fecha_realizada
            ? parseUtcDate(updateCuidadoDto.fecha_realizada)
            : null;
        }

        // Persiste el estado normalizado para mantener comparaciones consistentes.
        if (updateCuidadoDto.estado !== undefined) {
          changes.estado = estadoSolicitado;
        }

        // Aplica solo los campos validados sobre la instancia protegida por el bloqueo.
        manager
          .getRepository(Cuidado)
          .merge(cuidadoPersistido, changes as Partial<Cuidado>);

        // Guarda el nuevo estado antes de evaluar logros que cuentan cuidados completados.
        const cuidadoGuardado = await manager
          .getRepository(Cuidado)
          .save(cuidadoPersistido);

        // Sincroniza, bajo la misma transacción, fecha y estado del recordatorio relacionado.
        // El guardado del cuidado ya está protegido por bloqueo pesimista, evitando carreras.
        await this.recordatorioService.synchronizeForCuidado(
          manager,
          cuidadoGuardado,
          updateCuidadoDto.fecha_programada !== undefined,
        );

        // Al completar un cuidado, restaura la salud solo si el árbol no conserva
        // otros cuidados vencidos ni pendientes cuya fecha también haya pasado.
        if (pasaACompletado) {
          await this.restaurarSaludSiNoQuedanCuidadosVencidos(
            manager,
            cuidadoGuardado.id_cuidado,
            cuidadoGuardado.id_arbol,
          );
        }

        // Acredita XP/puntos base dentro de la transacción y obtiene contexto para logros opcionales.
        let recompensa = null;
        if (pasaACompletado) {
          recompensa = await this.gamificacionService.procesarCuidadoCompletado(
            manager,
            cuidadoGuardado.id_cuidado,
          );

          // Mantiene consistente la instancia que se devuelve si se marcó la recompensa.
          if (recompensa) {
            cuidadoGuardado.recompensado = true;
          }
        }

        // Devuelve el cuidado persistido y el contexto sin ejecutar consultas opcionales aquí.
        return { cuidado: cuidadoGuardado, recompensa };
      },
    );

    // Procesa logros después del commit para que sus errores no reviertan el estado ni el XP.
    if (resultado.recompensa) {
      await this.gamificacionService.procesarLogrosDeCuidado(
        resultado.recompensa,
      );
    }

    // Devuelve el cuidado confirmado por la transacción principal.
    return resultado.cuidado;
  }

  // Recupera el árbol cuando se resuelve su último cuidado vencido.
  private async restaurarSaludSiNoQuedanCuidadosVencidos(
    manager: EntityManager,
    idCuidadoCompletado: number,
    idArbol: number,
  ): Promise<void> {
    // Busca en la base sin hidratar cuidados; incluye pendientes ya vencidos
    // para cubrir la ventana previa a la siguiente ejecución del cron.
    const quedanCuidadosVencidos = await manager
      .getRepository(Cuidado)
      .createQueryBuilder('cuidado')
      .where('cuidado.id_arbol = :idArbol', { idArbol })
      .andWhere('cuidado.id_cuidado <> :idCuidado', {
        idCuidado: idCuidadoCompletado,
      })
      .andWhere(
        "(cuidado.estado = 'vencido' OR (cuidado.estado = 'pendiente' AND cuidado.fecha_programada <= :ahora))",
        { ahora: new Date() },
      )
      .getExists();

    // No sobrescribe otros estados del árbol ni restablece la salud si queda trabajo vencido.
    if (!quedanCuidadosVencidos) {
      await manager
        .getRepository(Arbol)
        .update(
          { id_arbol: idArbol, estado_salud: 'requiere_atencion' },
          { estado_salud: 'saludable' },
        );
    }
  }

  // Elimina físicamente un cuidado después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el cuidado que se desea eliminar.
    const cuidado: Cuidado = await this.findOne(id);

    // Elimina el cuidado de la base de datos.
    await this.cuidadoRepository.remove(cuidado);
  }
}
