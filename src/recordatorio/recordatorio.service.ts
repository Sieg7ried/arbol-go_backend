// Importa la excepción utilizada cuando no se encuentra un registro.
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar recordatorios.
import { CreateRecordatorioDto } from './dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from './dto/update-recordatorio.dto';

// Importa la entidad principal del módulo.
import { Recordatorio } from './entities/recordatorio.entity';

// Importa el cuidado para generar recordatorios automáticos asociados a actividades.
import { Cuidado } from '../cuidado/entities/cuidado.entity';

// Importa utilidades para separar instantes UTC en columnas de fecha y hora.
import {
  combineUtcDateAndTime,
  parseUtcDate,
  toUtcDatePart,
  toUtcTimePart,
} from '../common/fecha.util';

// Declara el servicio que contiene la lógica de negocio de los recordatorios.
@Injectable()
export class RecordatorioService {
  // Configura los repositorios necesarios para operar con recordatorios y árboles.
  constructor(
    // Inyecta el repositorio de recordatorios.
    @InjectRepository(Recordatorio)
    private readonly recordatorioRepository: Repository<Recordatorio>,

    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,
  ) {}

  // Crea un recordatorio después de validar que exista el árbol relacionado.
  async create(
    createRecordatorioDto: CreateRecordatorioDto,
  ): Promise<Recordatorio> {
    // Busca el árbol asociado al recordatorio.
    const arbol: Arbol | null = await this.arbolRepository.findOneBy({
      id_arbol: createRecordatorioDto.id_arbol,
    });

    // Informa si el árbol relacionado no existe.
    if (!arbol) {
      throw new NotFoundException(
        `Árbol con ID ${createRecordatorioDto.id_arbol} no encontrado`,
      );
    }

    // Separa la FK y la fecha para asignarlas con el formato correcto.
    const {
      id_arbol: _idArbol,
      fecha,
      ...recordatorioData
    } = createRecordatorioDto;

    // Crea una instancia de recordatorio con la relación validada.
    const recordatorio: Recordatorio = this.recordatorioRepository.create({
      ...recordatorioData,
      id_arbol: arbol.id_arbol,
      arbol,
      fecha: parseUtcDate(fecha),
    });

    // Guarda el recordatorio y devuelve el registro persistido.
    return await this.recordatorioRepository.save(recordatorio);
  }

  // Crea un recordatorio automático para un cuidado programado.
  async createForCuidado(cuidado: Cuidado): Promise<Recordatorio> {
    // Verifica que el cuidado tenga el árbol requerido para la relación.
    if (!cuidado.arbol) {
      throw new NotFoundException(
        `El cuidado ${cuidado.id_cuidado} no tiene árbol relacionado`,
      );
    }

    // Convierte la fecha programada a un instante UTC.
    const fechaProgramadaUtc = parseUtcDate(
      cuidado.fecha_programada.toISOString(),
    );

    // Separa el instante UTC en las columnas date y time existentes.
    const recordatorio = this.recordatorioRepository.create({
      id_arbol: cuidado.arbol.id_arbol,
      arbol: cuidado.arbol,
      titulo: `Cuidado: ${cuidado.tipo_cuidado}`,
      descripcion:
        cuidado.observaciones ??
        `Recordatorio automático para el cuidado ${cuidado.id_cuidado}`,
      fecha: new Date(`${toUtcDatePart(fechaProgramadaUtc)}T00:00:00.000Z`),
      hora: toUtcTimePart(fechaProgramadaUtc),
      repeticion: 'ninguna',
      estado: 'pendiente',
    });

    // Persiste el recordatorio enlazado al árbol del cuidado.
    return await this.recordatorioRepository.save(recordatorio);
  }

  // Busca recordatorios pendientes cuya fecha y hora UTC ya vencieron.
  async findPendingDue(now: Date): Promise<Recordatorio[]> {
    // Consulta recordatorios pendientes junto con su árbol.
    const recordatorios = await this.recordatorioRepository.find({
      where: { estado: 'pendiente' },
      relations: { arbol: true },
    });

    // Compara instantes absolutos y no valores dependientes de la zona local.
    return recordatorios.filter((recordatorio) => {
      // Reconstruye el instante UTC desde las columnas almacenadas.
      const fechaRecordatorio = combineUtcDateAndTime(
        recordatorio.fecha,
        recordatorio.hora,
      );

      // Conserva solo recordatorios que ya deben atenderse.
      return fechaRecordatorio.getTime() <= now.getTime();
    });
  }

  // Marca un recordatorio vencido como pendiente de atención.
  async markAsDue(recordatorio: Recordatorio): Promise<Recordatorio> {
    // Cambia el estado para impedir que el cronjob lo procese nuevamente.
    recordatorio.estado = 'pendiente_atencion';

    // Persiste el nuevo estado de atención.
    return await this.recordatorioRepository.save(recordatorio);
  }

  // Obtiene todos los recordatorios incluyendo el árbol relacionado.
  async findAll(): Promise<Recordatorio[]> {
    // Consulta todos los recordatorios junto con su árbol.
    return await this.recordatorioRepository.find({
      relations: {
        arbol: true,
      },
    });
  }

  // Obtiene un recordatorio específico por su identificador.
  async findOne(id: number): Promise<Recordatorio> {
    // Busca el recordatorio por su clave primaria e incluye el árbol relacionado.
    const recordatorio: Recordatorio | null =
      await this.recordatorioRepository.findOne({
        where: { id_recordatorio: id },
        relations: {
          arbol: true,
        },
      });

    // Informa si no existe un recordatorio con el identificador recibido.
    if (!recordatorio) {
      throw new NotFoundException(
        `Recordatorio con ID ${id} no encontrado`,
      );
    }

    // Devuelve el recordatorio encontrado.
    return recordatorio;
  }

  // Actualiza un recordatorio y valida el árbol si se modifica la relación.
  async update(
    id: number,
    updateRecordatorioDto: UpdateRecordatorioDto,
  ): Promise<Recordatorio> {
    // Busca el recordatorio que se desea actualizar.
    const recordatorio: Recordatorio = await this.findOne(id);

    // Copia los cambios recibidos para procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateRecordatorioDto,
    };

    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateRecordatorioDto.id_arbol !== undefined) {
      // Impide transferir el recordatorio a un árbol de otro propietario.
      throw new ForbiddenException(
        'No puedes cambiar el árbol propietario del recordatorio',
      );
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateRecordatorioDto.fecha !== undefined) {
      changes.fecha = parseUtcDate(updateRecordatorioDto.fecha);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.recordatorioRepository.merge(
      recordatorio,
      changes as Partial<Recordatorio>,
    );

    // Guarda y devuelve el recordatorio actualizado.
    return await this.recordatorioRepository.save(recordatorio);
  }

  // Elimina físicamente un recordatorio después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el recordatorio que se desea eliminar.
    const recordatorio: Recordatorio = await this.findOne(id);

    // Elimina el recordatorio de la base de datos.
    await this.recordatorioRepository.remove(recordatorio);
  }
}
