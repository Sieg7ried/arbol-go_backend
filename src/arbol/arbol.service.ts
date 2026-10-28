// Importa las excepciones HTTP utilizadas por el servicio.
import { Injectable, NotFoundException } from '@nestjs/common';

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

  // Crea un árbol después de validar que existan su usuario y su especie.
  async create(createArbolDto: CreateArbolDto): Promise<Arbol> {
    // Busca el usuario asociado al árbol.
    const usuario: User | null = await this.userRepository.findOneBy({
      id: createArbolDto.id_usuario,
    });

    // Informa si el usuario relacionado no existe.
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createArbolDto.id_usuario} no encontrado`,
      );
    }

    // Busca la especie asociada al árbol.
    const especie: Especie | null = await this.especieRepository.findOneBy({
      id: createArbolDto.id_especie,
    });

    // Informa si la especie relacionada no existe.
    if (!especie) {
      throw new NotFoundException(
        `Especie con ID ${createArbolDto.id_especie} no encontrada`,
      );
    }

    // Extrae los identificadores para asignar las relaciones mediante sus entidades.
    const {
      id_usuario: _idUsuario,
      id_especie: _idEspecie,
      ...treeData
    } = createArbolDto;

    // Crea una instancia de árbol con las relaciones validadas.
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
      // Busca el nuevo usuario relacionado.
      const usuario: User | null = await this.userRepository.findOneBy({
        id: updateArbolDto.id_usuario,
      });

      // Informa si el nuevo usuario no existe.
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con ID ${updateArbolDto.id_usuario} no encontrado`,
        );
      }

      // Asigna el usuario validado al árbol.
      arbol.usuario = usuario;

      // Evita enviar el identificador como una columna independiente.
      delete changes.id_usuario;
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

  // Elimina físicamente un árbol después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el árbol que se desea eliminar.
    const arbol: Arbol = await this.findOne(id);

    // Elimina el árbol de la base de datos.
    await this.arbolRepository.remove(arbol);
  }
}
