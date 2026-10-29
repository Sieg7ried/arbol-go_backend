// Importa la excepción utilizada cuando no se encuentra un registro.
import { Injectable, NotFoundException } from '@nestjs/common';

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
      fecha: new Date(fecha),
    });

    // Guarda el recordatorio y devuelve el registro persistido.
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
      // Busca el nuevo árbol relacionado.
      const arbol: Arbol | null = await this.arbolRepository.findOneBy({
        id_arbol: updateRecordatorioDto.id_arbol,
      });

      // Informa si el nuevo árbol no existe.
      if (!arbol) {
        throw new NotFoundException(
          `Árbol con ID ${updateRecordatorioDto.id_arbol} no encontrado`,
        );
      }

      // Asigna el árbol validado y actualiza explícitamente la FK.
      recordatorio.arbol = arbol;
      recordatorio.id_arbol = arbol.id_arbol;

      // Evita enviar el identificador como un cambio independiente.
      delete changes.id_arbol;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateRecordatorioDto.fecha !== undefined) {
      changes.fecha = new Date(updateRecordatorioDto.fecha);
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
