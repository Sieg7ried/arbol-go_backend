// Importa la excepción utilizada cuando no se encuentra un registro.
import { Injectable, NotFoundException } from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar historiales.
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

// Importa la entidad principal del módulo.
import { Historial } from './entities/historial.entity';

// Declara el servicio que contiene la lógica de negocio de los historiales.
@Injectable()
export class HistorialService {
  // Configura los repositorios necesarios para operar con historiales y árboles.
  constructor(
    // Inyecta el repositorio de historiales.
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,

    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,
  ) {}

  // Crea un historial después de validar que exista el árbol relacionado.
  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    // Busca el árbol asociado al historial.
    const arbol: Arbol | null = await this.arbolRepository.findOneBy({
      id_arbol: createHistorialDto.id_arbol,
    });

    // Informa si el árbol relacionado no existe.
    if (!arbol) {
      throw new NotFoundException(
        `Árbol con ID ${createHistorialDto.id_arbol} no encontrado`,
      );
    }

    // Separa la FK y la fecha para asignarlas con el formato correcto.
    const {
      id_arbol: _idArbol,
      fecha,
      ...historialData
    } = createHistorialDto;

    // Crea una instancia de historial con la relación validada.
    const historial: Historial = this.historialRepository.create({
      ...historialData,
      id_arbol: arbol.id_arbol,
      arbol,
      fecha: new Date(fecha),
    });

    // Guarda el historial y devuelve el registro persistido.
    return await this.historialRepository.save(historial);
  }

  // Obtiene todos los historiales incluyendo el árbol relacionado.
  async findAll(): Promise<Historial[]> {
    // Consulta todos los historiales junto con su árbol.
    return await this.historialRepository.find({
      relations: {
        arbol: true,
      },
    });
  }

  // Obtiene un historial específico por su identificador.
  async findOne(id: number): Promise<Historial> {
    // Busca el historial por su clave primaria e incluye el árbol relacionado.
    const historial: Historial | null = await this.historialRepository.findOne({
      where: { id_historial: id },
      relations: {
        arbol: true,
      },
    });

    // Informa si no existe un historial con el identificador recibido.
    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    // Devuelve el historial encontrado.
    return historial;
  }

  // Actualiza un historial y valida el árbol si se modifica la relación.
  async update(
    id: number,
    updateHistorialDto: UpdateHistorialDto,
  ): Promise<Historial> {
    // Busca el historial que se desea actualizar.
    const historial: Historial = await this.findOne(id);

    // Copia los cambios recibidos para procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateHistorialDto,
    };

    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateHistorialDto.id_arbol !== undefined) {
      // Busca el nuevo árbol relacionado.
      const arbol: Arbol | null = await this.arbolRepository.findOneBy({
        id_arbol: updateHistorialDto.id_arbol,
      });

      // Informa si el nuevo árbol no existe.
      if (!arbol) {
        throw new NotFoundException(
          `Árbol con ID ${updateHistorialDto.id_arbol} no encontrado`,
        );
      }

      // Asigna el árbol validado y actualiza explícitamente la FK.
      historial.arbol = arbol;
      historial.id_arbol = arbol.id_arbol;

      // Evita enviar el identificador como un cambio independiente.
      delete changes.id_arbol;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateHistorialDto.fecha !== undefined) {
      changes.fecha = new Date(updateHistorialDto.fecha);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.historialRepository.merge(
      historial,
      changes as Partial<Historial>,
    );

    // Guarda y devuelve el historial actualizado.
    return await this.historialRepository.save(historial);
  }

  // Elimina físicamente un historial después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el historial que se desea eliminar.
    const historial: Historial = await this.findOne(id);

    // Elimina el historial de la base de datos.
    await this.historialRepository.remove(historial);
  }
}
