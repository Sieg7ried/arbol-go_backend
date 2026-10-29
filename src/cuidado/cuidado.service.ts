// Importa la excepción utilizada cuando no se encuentra un registro.
import { Injectable, NotFoundException } from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar cuidados.
import { CreateCuidadoDto } from './dto/create-cuidado.dto';
import { UpdateCuidadoDto } from './dto/update-cuidado.dto';

// Importa la entidad principal del módulo.
import { Cuidado } from './entities/cuidado.entity';

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
      fecha_programada: new Date(fecha_programada),
      fecha_realizada: fecha_realizada ? new Date(fecha_realizada) : null,
    });

    // Guarda el cuidado y devuelve el registro persistido.
    return await this.cuidadoRepository.save(cuidado);
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
        arbol: true,
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
      // Busca el nuevo árbol relacionado.
      const arbol: Arbol | null = await this.arbolRepository.findOneBy({
        id_arbol: updateCuidadoDto.id_arbol,
      });

      // Informa si el nuevo árbol no existe.
      if (!arbol) {
        throw new NotFoundException(
          `Árbol con ID ${updateCuidadoDto.id_arbol} no encontrado`,
        );
      }

      // Asigna el árbol validado y actualiza explícitamente la FK.
      cuidado.arbol = arbol;
      cuidado.id_arbol = arbol.id_arbol;

      // Evita enviar el identificador como un cambio independiente.
      delete changes.id_arbol;
    }

    // Convierte la fecha programada a una instancia de Date.
    if (updateCuidadoDto.fecha_programada !== undefined) {
      changes.fecha_programada = new Date(
        updateCuidadoDto.fecha_programada,
      );
    }

    // Convierte la fecha realizada a Date o null cuando corresponde.
    if (updateCuidadoDto.fecha_realizada !== undefined) {
      changes.fecha_realizada = updateCuidadoDto.fecha_realizada
        ? new Date(updateCuidadoDto.fecha_realizada)
        : null;
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.cuidadoRepository.merge(cuidado, changes as Partial<Cuidado>);

    // Guarda y devuelve el cuidado actualizado.
    return await this.cuidadoRepository.save(cuidado);
  }

  // Elimina físicamente un cuidado después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el cuidado que se desea eliminar.
    const cuidado: Cuidado = await this.findOne(id);

    // Elimina el cuidado de la base de datos.
    await this.cuidadoRepository.remove(cuidado);
  }
}
