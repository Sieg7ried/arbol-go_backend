// Importa la excepción utilizada cuando no se encuentra un registro.
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { DataSource, EntityManager, Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar cuidados.
import { CreateCuidadoDto } from './dto/create-cuidado.dto';
import { UpdateCuidadoDto } from './dto/update-cuidado.dto';

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
  // Configura los repositorios necesarios para operar con cuidados y árboles.
  constructor(
    // Inyecta el repositorio de cuidados.
    @InjectRepository(Cuidado)
    private readonly cuidadoRepository: Repository<Cuidado>,

    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,

    // Permite ejecutar el cambio de cuidado y la recompensa de forma atómica.
    private readonly dataSource: DataSource,

    // Procesa las recompensas cuando el cuidado se completa.
    private readonly gamificacionService: GamificacionService,

    // Crea recordatorios enlazados al árbol del cuidado.
    private readonly recordatorioService: RecordatorioService,
  ) {}

  // Crea un cuidado después de validar que exista el árbol relacionado.
  async create(createCuidadoDto: CreateCuidadoDto): Promise<Cuidado> {
    // Busca el árbol asociado al cuidado.
    const arbol: Arbol | null = await this.arbolRepository.findOneBy({
      id_arbol: createCuidadoDto.id_arbol,
    });

    // Informa si el árbol relacionado no existe.
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
    const cuidado: Cuidado = this.cuidadoRepository.create({
      ...cuidadoData,
      id_arbol: arbol.id_arbol,
      arbol,
      fecha_programada: parseUtcDate(fecha_programada),
      fecha_realizada: fecha_realizada
        ? parseUtcDate(fecha_realizada)
        : null,
    });

    // Guarda el cuidado antes de generar su recordatorio automático.
    const cuidadoGuardado = await this.cuidadoRepository.save(cuidado);

    // Crea el recordatorio porque fecha_programada es obligatoria.
    await this.recordatorioService.createForCuidado(cuidadoGuardado);

    // Devuelve el cuidado persistido sin alterar el contrato CRUD.
    return cuidadoGuardado;
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

  // Actualiza un cuidado y valida el árbol si se modifica la relación.
  async update(
    id: number,
    updateCuidadoDto: UpdateCuidadoDto,
  ): Promise<Cuidado> {
    // Busca el cuidado que se desea actualizar.
    const cuidado: Cuidado = await this.findOne(id);

    // Copia los cambios recibidos para procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateCuidadoDto,
    };

    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateCuidadoDto.id_arbol !== undefined) {
      // Impide transferir el cuidado a un árbol que podría pertenecer a otro usuario.
      throw new ForbiddenException(
        'No puedes cambiar el árbol propietario del cuidado',
      );
    }

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

    // Aplica los cambios restantes sobre la entidad existente.
    this.cuidadoRepository.merge(cuidado, changes as Partial<Cuidado>);

    // Determina el estado solicitado después de aplicar los cambios.
    const estadoSolicitado = cuidado.estado.toLowerCase();

    // Ejecuta el guardado y la recompensa en una transacción única.
    return await this.dataSource.transaction(
      async (manager: EntityManager): Promise<Cuidado> => {
        // Vuelve a leer y bloquea el cuidado para evitar recompensas concurrentes.
        const cuidadoPersistido = await manager
          .getRepository(Cuidado)
          .findOne({
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

        // Comprueba la transición usando el estado realmente persistido.
        const pasaACompletado =
          cuidadoPersistido.estado.toLowerCase() !== 'completado' &&
          estadoSolicitado === 'completado';

        // Aplica los cambios preparados sobre la fila bloqueada.
        manager.getRepository(Cuidado).merge(cuidadoPersistido, cuidado);

        // Guarda el cuidado actualizado dentro de la transacción.
        const cuidadoGuardado = await manager
          .getRepository(Cuidado)
          .save(cuidadoPersistido);

        // Detecta si la fecha programada fue modificada al reprogramar el cuidado.
        const fueReprogramado =
          updateCuidadoDto.fecha_programada !== undefined;

        // Crea un nuevo recordatorio para la programación vigente.
        if (fueReprogramado && cuidadoGuardado.estado !== 'completado') {
          await this.recordatorioService.createForCuidado(cuidadoGuardado);
        }

        // Recompensa únicamente la primera transición a completado.
        if (pasaACompletado) {
          await this.gamificacionService.procesarCuidadoCompletado(
            manager,
            cuidadoGuardado,
          );
        }

        // Devuelve el cuidado actualizado al controlador.
        return cuidadoGuardado;
      },
    );
  }

  // Elimina físicamente un cuidado después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el cuidado que se desea eliminar.
    const cuidado: Cuidado = await this.findOne(id);

    // Elimina el cuidado de la base de datos.
    await this.cuidadoRepository.remove(cuidado);
  }
}
