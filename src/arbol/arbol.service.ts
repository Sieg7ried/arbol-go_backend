// Importa las excepciones HTTP utilizadas por el servicio.
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Especie para validar la relación correspondiente.
import { Especie } from '../especie/entities/especie.entity';

// Importa la entidad User para validar y asignar el usuario propietario.
import { User } from '../user/entities/user.entity';

// Importa los DTO utilizados para crear y actualizar árboles.
import { CreateArbolDto } from './dto/create-arbol.dto';
import { UpdateArbolDto } from './dto/update-arbol.dto';

// Importa la entidad principal del módulo.
import { Arbol } from './entities/arbol.entity';

// Declara el servicio que contiene la lógica de negocio de los árboles.
@Injectable()
export class ArbolService {
  // Configura los repositorios necesarios para operar con árboles, usuarios y especies.
  constructor(
    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,

    // Inyecta el repositorio de usuarios.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Inyecta el repositorio de especies.
    @InjectRepository(Especie)
    private readonly especieRepository: Repository<Especie>,
  ) {}

  // Crea un árbol asignándolo al usuario autenticado y valida su especie relacionada.
  async create(
    idUsuario: number,
    createArbolDto: CreateArbolDto,
  ): Promise<Arbol> {
    // Busca al propietario usando exclusivamente el ID verificado que recibió desde el JWT.
    const usuario: User | null = await this.userRepository.findOneBy({
      id: idUsuario,
    });

    // Rechaza la creación si el usuario autenticado ya no existe en la base de datos.
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${idUsuario} no encontrado`,
      );
    }

    // Busca la especie relacionada con el árbol; es un catálogo global, no propiedad de un usuario.
    const especie: Especie | null = await this.especieRepository.findOneBy({
      id: createArbolDto.id_especie,
    });

    // Rechaza la creación si la especie referenciada no existe.
    if (!especie) {
      throw new NotFoundException(
        `Especie con ID ${createArbolDto.id_especie} no encontrada`,
      );
    }

    // Extrae id_especie para guardar la relación mediante la entidad ya validada.
    const { id_especie: _idEspecie, ...treeData } = createArbolDto;

    // Asigna la relación de usuario desde el JWT, impidiendo elegir propietario mediante el body.
    // Asigna también la especie existente que se validó desde el catálogo global.
    const arbol: Arbol = this.arbolRepository.create({
      ...treeData,
      usuario,
      especie,
      fecha_siembra: new Date(createArbolDto.fecha_siembra),
    });

    // Guarda el árbol y devuelve el registro persistido.
    return await this.arbolRepository.save(arbol);
  }

  // Obtiene todos los árboles junto con sus relaciones de usuario y especie.
  async findAll(): Promise<Arbol[]> {
    // Consulta todos los árboles incluyendo usuario y especie.
    return await this.arbolRepository.find({
      relations: {
        usuario: true,
        especie: true,
      },
    });
  }

  // Obtiene un árbol específico por su identificador.
  async findOne(id: number): Promise<Arbol> {
    // Busca el árbol por su clave primaria e incluye sus relaciones.
    const arbol: Arbol | null = await this.arbolRepository.findOne({
      where: { id_arbol: id },
      relations: {
        usuario: true,
        especie: true,
      },
    });

    // Informa si no existe un árbol con el identificador recibido.
    if (!arbol) {
      throw new NotFoundException(`Árbol con ID ${id} no encontrado`);
    }

    // Devuelve el árbol encontrado.
    return arbol;
  }

  // Actualiza los datos de un árbol y valida sus nuevas relaciones.
  async update(
    id: number,
    updateArbolDto: UpdateArbolDto,
  ): Promise<Arbol> {
    // Busca el árbol que se desea actualizar.
    const arbol: Arbol = await this.findOne(id);

    // Copia los cambios recibidos para poder procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateArbolDto,
    };

    // Comprueba si se solicitó cambiar el usuario relacionado.
    if (updateArbolDto.id_usuario !== undefined) {
      // Impide que un propietario transfiera el árbol mediante un DTO manipulable.
      throw new ForbiddenException(
        'No puedes cambiar el propietario del árbol',
      );
    }

    // Comprueba si se solicitó cambiar la especie relacionada.
    if (updateArbolDto.id_especie !== undefined) {
      // Busca la nueva especie relacionada.
      const especie: Especie | null = await this.especieRepository.findOneBy({
        id: updateArbolDto.id_especie,
      });

      // Informa si la nueva especie no existe.
      if (!especie) {
        throw new NotFoundException(
          `Especie con ID ${updateArbolDto.id_especie} no encontrada`,
        );
      }

      // Asigna la especie validada al árbol.
      arbol.especie = especie;

      // Evita enviar el identificador como una columna independiente.
      delete changes.id_especie;
    }

    // Convierte la fecha recibida a una instancia de Date cuando se actualiza.
    if (updateArbolDto.fecha_siembra !== undefined) {
      changes.fecha_siembra = new Date(updateArbolDto.fecha_siembra);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.arbolRepository.merge(arbol, changes as Partial<Arbol>);

    // Guarda y devuelve el árbol actualizado.
    return await this.arbolRepository.save(arbol);
  }

  // Archiva el árbol después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el árbol que se desea eliminar.
    const arbol: Arbol = await this.findOne(id);

    // Conserva cuidados, fotos y crecimiento, evitando romper sus claves foráneas.
    await this.arbolRepository.softRemove(arbol);
  }
}
