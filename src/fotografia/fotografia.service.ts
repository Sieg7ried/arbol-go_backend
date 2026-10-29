// Importa la excepción utilizada cuando no se encuentra un registro.
import { Injectable, NotFoundException } from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar fotografías.
import { CreateFotografiaDto } from './dto/create-fotografia.dto';
import { UpdateFotografiaDto } from './dto/update-fotografia.dto';

// Importa la entidad principal del módulo.
import { Fotografia } from './entities/fotografia.entity';

// Declara el servicio que contiene la lógica de negocio de las fotografías.
@Injectable()
export class FotografiaService {
  // Configura los repositorios necesarios para operar con fotografías y árboles.
  constructor(
    // Inyecta el repositorio de fotografías.
    @InjectRepository(Fotografia)
    private readonly fotografiaRepository: Repository<Fotografia>,

    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,
  ) {}

  // Crea una fotografía después de validar que exista el árbol relacionado.
  async create(createFotografiaDto: CreateFotografiaDto): Promise<Fotografia> {
    // Busca el árbol asociado a la fotografía.
    const arbol: Arbol | null = await this.arbolRepository.findOneBy({
      id_arbol: createFotografiaDto.id_arbol,
    });

    // Informa si el árbol relacionado no existe.
    if (!arbol) {
      throw new NotFoundException(
        `Árbol con ID ${createFotografiaDto.id_arbol} no encontrado`,
      );
    }

    // Separa la FK y la fecha para asignarlas con el formato correcto.
    const {
      id_arbol: _idArbol,
      fecha,
      ...fotografiaData
    } = createFotografiaDto;

    // Crea una instancia de fotografía con la relación validada.
    const fotografia: Fotografia = this.fotografiaRepository.create({
      ...fotografiaData,
      id_arbol: arbol.id_arbol,
      arbol,
      fecha: new Date(fecha),
    });

    // Guarda la fotografía y devuelve el registro persistido.
    return await this.fotografiaRepository.save(fotografia);
  }

  // Obtiene todas las fotografías incluyendo el árbol relacionado.
  async findAll(): Promise<Fotografia[]> {
    // Consulta todas las fotografías junto con su árbol.
    return await this.fotografiaRepository.find({
      relations: {
        arbol: true,
      },
    });
  }

  // Obtiene una fotografía específica por su identificador.
  async findOne(id: number): Promise<Fotografia> {
    // Busca la fotografía por su clave primaria e incluye el árbol relacionado.
    const fotografia: Fotografia | null =
      await this.fotografiaRepository.findOne({
        where: { id_foto: id },
        relations: {
          arbol: true,
        },
      });

    // Informa si no existe una fotografía con el identificador recibido.
    if (!fotografia) {
      throw new NotFoundException(`Fotografía con ID ${id} no encontrada`);
    }

    // Devuelve la fotografía encontrada.
    return fotografia;
  }

  // Actualiza una fotografía y valida el árbol si se modifica la relación.
  async update(
    id: number,
    updateFotografiaDto: UpdateFotografiaDto,
  ): Promise<Fotografia> {
    // Busca la fotografía que se desea actualizar.
    const fotografia: Fotografia = await this.findOne(id);

    // Copia los cambios recibidos para procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateFotografiaDto,
    };

    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateFotografiaDto.id_arbol !== undefined) {
      // Busca el nuevo árbol relacionado.
      const arbol: Arbol | null = await this.arbolRepository.findOneBy({
        id_arbol: updateFotografiaDto.id_arbol,
      });

      // Informa si el nuevo árbol no existe.
      if (!arbol) {
        throw new NotFoundException(
          `Árbol con ID ${updateFotografiaDto.id_arbol} no encontrado`,
        );
      }

      // Asigna el árbol validado y actualiza explícitamente la FK.
      fotografia.arbol = arbol;
      fotografia.id_arbol = arbol.id_arbol;

      // Evita enviar el identificador como un cambio independiente.
      delete changes.id_arbol;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateFotografiaDto.fecha !== undefined) {
      changes.fecha = new Date(updateFotografiaDto.fecha);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.fotografiaRepository.merge(
      fotografia,
      changes as Partial<Fotografia>,
    );

    // Guarda y devuelve la fotografía actualizada.
    return await this.fotografiaRepository.save(fotografia);
  }

  // Elimina físicamente una fotografía después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca la fotografía que se desea eliminar.
    const fotografia: Fotografia = await this.findOne(id);

    // Elimina la fotografía de la base de datos.
    await this.fotografiaRepository.remove(fotografia);
  }
}
