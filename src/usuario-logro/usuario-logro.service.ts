// Importa las excepciones utilizadas por el servicio.
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad User para validar la relación correspondiente.
import { User } from '../user/entities/user.entity';

// Importa la entidad Logro para validar la relación correspondiente.
import { Logro } from '../logro/entities/logro.entity';

// Importa los DTO utilizados para crear y actualizar registros.
import { CreateUsuarioLogroDto } from './dto/create-usuario-logro.dto';
import { UpdateUsuarioLogroDto } from './dto/update-usuario-logro.dto';

// Importa la entidad principal del módulo.
import { UsuarioLogro } from './entities/usuario-logro.entity';

// Declara el servicio que contiene la lógica de negocio de la tabla intermedia.
@Injectable()
export class UsuarioLogroService {
  // Configura los repositorios necesarios para operar con usuarios, logros y relaciones.
  constructor(
    // Inyecta el repositorio de la tabla intermedia.
    @InjectRepository(UsuarioLogro)
    private readonly usuarioLogroRepository: Repository<UsuarioLogro>,

    // Inyecta el repositorio de usuarios.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Inyecta el repositorio de logros.
    @InjectRepository(Logro)
    private readonly logroRepository: Repository<Logro>,
  ) {}

  // Crea una relación entre un usuario y un logro.
  async create(
    createUsuarioLogroDto: CreateUsuarioLogroDto,
  ): Promise<UsuarioLogro> {
    // Busca el usuario asociado.
    const usuario: User | null = await this.userRepository.findOneBy({
      id: createUsuarioLogroDto.id_usuario,
    });

    // Informa si el usuario relacionado no existe.
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createUsuarioLogroDto.id_usuario} no encontrado`,
      );
    }

    // Busca el logro asociado.
    const logro: Logro | null = await this.logroRepository.findOneBy({
      id: createUsuarioLogroDto.id_logro,
    });

    // Informa si el logro relacionado no existe.
    if (!logro) {
      throw new NotFoundException(
        `Logro con ID ${createUsuarioLogroDto.id_logro} no encontrado`,
      );
    }

    // Comprueba si la relación ya está registrada.
    const existingRelation: UsuarioLogro | null =
      await this.usuarioLogroRepository.findOneBy({
        id_usuario: createUsuarioLogroDto.id_usuario,
        id_logro: createUsuarioLogroDto.id_logro,
      });

    // Evita duplicar la combinación de usuario y logro.
    if (existingRelation) {
      throw new ConflictException(
        'El usuario ya tiene registrado este logro',
      );
    }

    // Crea la relación con las entidades previamente validadas.
    const usuarioLogro: UsuarioLogro = this.usuarioLogroRepository.create({
      id_usuario: usuario.id,
      id_logro: logro.id,
      usuario,
      logro,
      fecha_obtenido: new Date(createUsuarioLogroDto.fecha_obtenido),
    });

    // Guarda la relación y devuelve el registro persistido.
    return await this.usuarioLogroRepository.save(usuarioLogro);
  }

  // Obtiene todas las relaciones incluyendo usuario y logro.
  async findAll(): Promise<UsuarioLogro[]> {
    // Consulta todos los registros junto con sus relaciones.
    return await this.usuarioLogroRepository.find({
      relations: {
        usuario: true,
        logro: true,
      },
    });
  }

  // Obtiene un registro por la clave primaria compuesta.
  async findOne(
    id_usuario: number,
    id_logro: number,
  ): Promise<UsuarioLogro> {
    // Busca la relación utilizando ambos identificadores.
    const usuarioLogro: UsuarioLogro | null =
      await this.usuarioLogroRepository.findOne({
        where: {
          id_usuario,
          id_logro,
        },
        relations: {
          usuario: true,
          logro: true,
        },
      });

    // Informa si no existe la relación solicitada.
    if (!usuarioLogro) {
      throw new NotFoundException(
        `Relación entre usuario ${id_usuario} y logro ${id_logro} no encontrada`,
      );
    }

    // Devuelve el registro encontrado.
    return usuarioLogro;
  }

  // Actualiza una relación y valida las entidades relacionadas.
  async update(
    id_usuario: number,
    id_logro: number,
    updateUsuarioLogroDto: UpdateUsuarioLogroDto,
  ): Promise<UsuarioLogro> {
    // Busca el registro que se desea actualizar.
    const usuarioLogro: UsuarioLogro = await this.findOne(
      id_usuario,
      id_logro,
    );

    // Copia los cambios recibidos para no modificar el DTO original.
    const changes: Record<string, unknown> = {
      ...updateUsuarioLogroDto,
    };

    // Comprueba si se solicitó cambiar el usuario relacionado.
    if (updateUsuarioLogroDto.id_usuario !== undefined) {
      // Busca el nuevo usuario.
      const usuario: User | null = await this.userRepository.findOneBy({
        id: updateUsuarioLogroDto.id_usuario,
      });

      // Informa si el nuevo usuario no existe.
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con ID ${updateUsuarioLogroDto.id_usuario} no encontrado`,
        );
      }

      // Asigna el usuario validado y actualiza la FK.
      usuarioLogro.usuario = usuario;
      usuarioLogro.id_usuario = usuario.id;

      // Evita enviar el identificador como cambio independiente.
      delete changes.id_usuario;
    }

    // Comprueba si se solicitó cambiar el logro relacionado.
    if (updateUsuarioLogroDto.id_logro !== undefined) {
      // Busca el nuevo logro.
      const logro: Logro | null = await this.logroRepository.findOneBy({
        id: updateUsuarioLogroDto.id_logro,
      });

      // Informa si el nuevo logro no existe.
      if (!logro) {
        throw new NotFoundException(
          `Logro con ID ${updateUsuarioLogroDto.id_logro} no encontrado`,
        );
      }

      // Asigna el logro validado y actualiza la FK.
      usuarioLogro.logro = logro;
      usuarioLogro.id_logro = logro.id;

      // Evita enviar el identificador como cambio independiente.
      delete changes.id_logro;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateUsuarioLogroDto.fecha_obtenido !== undefined) {
      changes.fecha_obtenido = new Date(
        updateUsuarioLogroDto.fecha_obtenido,
      );
    }

    // Comprueba que la nueva combinación no duplique otro registro.
    if (
      usuarioLogro.id_usuario !== id_usuario ||
      usuarioLogro.id_logro !== id_logro
    ) {
      // Busca otra relación con la nueva clave compuesta.
      const duplicateRelation: UsuarioLogro | null =
        await this.usuarioLogroRepository.findOneBy({
          id_usuario: usuarioLogro.id_usuario,
          id_logro: usuarioLogro.id_logro,
        });

      // Evita guardar una combinación duplicada.
      if (duplicateRelation) {
        throw new ConflictException(
          'La nueva combinación de usuario y logro ya está registrada',
        );
      }
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.usuarioLogroRepository.merge(
      usuarioLogro,
      changes as Partial<UsuarioLogro>,
    );

    // Guarda y devuelve la relación actualizada.
    return await this.usuarioLogroRepository.save(usuarioLogro);
  }

  // Elimina una relación después de comprobar que existe.
  async remove(id_usuario: number, id_logro: number): Promise<void> {
    // Busca el registro que se desea eliminar.
    const usuarioLogro: UsuarioLogro = await this.findOne(
      id_usuario,
      id_logro,
    );

    // Elimina la relación de la base de datos.
    await this.usuarioLogroRepository.remove(usuarioLogro);
  }
}
