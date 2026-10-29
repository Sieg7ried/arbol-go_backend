// Importa la excepción utilizada cuando no se encuentra un registro.
import { Injectable, NotFoundException } from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad User para validar la relación correspondiente.
import { User } from '../user/entities/user.entity';

// Importa la entidad Publicacion para validar la relación correspondiente.
import { Publicacion } from '../publicacion/entities/publicacion.entity';

// Importa los DTO utilizados para crear y actualizar comentarios.
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';

// Importa la entidad principal del módulo.
import { Comentario } from './entities/comentario.entity';

// Declara el servicio que contiene la lógica de negocio de los comentarios.
@Injectable()
export class ComentarioService {
  // Configura los repositorios necesarios para operar con comentarios,
  // usuarios y publicaciones.
  constructor(
    // Inyecta el repositorio de comentarios.
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,

    // Inyecta el repositorio de usuarios.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Inyecta el repositorio de publicaciones.
    @InjectRepository(Publicacion)
    private readonly publicacionRepository: Repository<Publicacion>,
  ) {}

  // Crea un comentario después de validar sus relaciones.
  async create(createComentarioDto: CreateComentarioDto): Promise<Comentario> {
    // Busca el usuario asociado al comentario.
    const usuario: User | null = await this.userRepository.findOneBy({
      id: createComentarioDto.id_usuario,
    });

    // Informa si el usuario relacionado no existe.
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createComentarioDto.id_usuario} no encontrado`,
      );
    }

    // Busca la publicación asociada al comentario.
    const publicacion: Publicacion | null =
      await this.publicacionRepository.findOneBy({
        id_publicacion: createComentarioDto.id_publicacion,
      });

    // Informa si la publicación relacionada no existe.
    if (!publicacion) {
      throw new NotFoundException(
        `Publicación con ID ${createComentarioDto.id_publicacion} no encontrada`,
      );
    }

    // Separa las claves foráneas y la fecha para asignarlas correctamente.
    const {
      id_usuario: _idUsuario,
      id_publicacion: _idPublicacion,
      fecha,
      ...comentarioData
    } = createComentarioDto;

    // Crea una instancia con las relaciones previamente validadas.
    const comentario: Comentario = this.comentarioRepository.create({
      ...comentarioData,
      id_usuario: usuario.id,
      usuario,
      id_publicacion: publicacion.id_publicacion,
      publicacion,
      fecha: new Date(fecha),
    });

    // Guarda el comentario y devuelve el registro persistido.
    return await this.comentarioRepository.save(comentario);
  }

  // Obtiene todos los comentarios incluyendo usuario y publicación.
  async findAll(): Promise<Comentario[]> {
    // Consulta todos los comentarios junto con sus relaciones.
    return await this.comentarioRepository.find({
      relations: {
        usuario: true,
        publicacion: true,
      },
    });
  }

  // Obtiene un comentario específico por su identificador.
  async findOne(id: number): Promise<Comentario> {
    // Busca el comentario por su clave primaria e incluye sus relaciones.
    const comentario: Comentario | null =
      await this.comentarioRepository.findOne({
        where: { id_comentario: id },
        relations: {
          usuario: true,
          publicacion: true,
        },
      });

    // Informa si no existe un comentario con el identificador recibido.
    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    // Devuelve el comentario encontrado.
    return comentario;
  }

  // Actualiza un comentario y valida sus relaciones si cambian.
  async update(
    id: number,
    updateComentarioDto: UpdateComentarioDto,
  ): Promise<Comentario> {
    // Busca el comentario que se desea actualizar.
    const comentario: Comentario = await this.findOne(id);

    // Copia los cambios recibidos para no modificar el DTO original.
    const changes: Record<string, unknown> = {
      ...updateComentarioDto,
    };

    // Comprueba si se solicitó cambiar el usuario relacionado.
    if (updateComentarioDto.id_usuario !== undefined) {
      // Busca el nuevo usuario relacionado.
      const usuario: User | null = await this.userRepository.findOneBy({
        id: updateComentarioDto.id_usuario,
      });

      // Informa si el nuevo usuario no existe.
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con ID ${updateComentarioDto.id_usuario} no encontrado`,
        );
      }

      // Asigna el usuario validado y actualiza explícitamente la FK.
      comentario.usuario = usuario;
      comentario.id_usuario = usuario.id;

      // Evita enviar el identificador como un cambio independiente.
      delete changes.id_usuario;
    }

    // Comprueba si se solicitó cambiar la publicación relacionada.
    if (updateComentarioDto.id_publicacion !== undefined) {
      // Busca la nueva publicación relacionada.
      const publicacion: Publicacion | null =
        await this.publicacionRepository.findOneBy({
          id_publicacion: updateComentarioDto.id_publicacion,
        });

      // Informa si la publicación no existe.
      if (!publicacion) {
        throw new NotFoundException(
          `Publicación con ID ${updateComentarioDto.id_publicacion} no encontrada`,
        );
      }

      // Asigna la publicación validada y actualiza explícitamente la FK.
      comentario.publicacion = publicacion;
      comentario.id_publicacion = publicacion.id_publicacion;

      // Evita enviar el identificador como un cambio independiente.
      delete changes.id_publicacion;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateComentarioDto.fecha !== undefined) {
      changes.fecha = new Date(updateComentarioDto.fecha);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.comentarioRepository.merge(
      comentario,
      changes as Partial<Comentario>,
    );

    // Guarda y devuelve el comentario actualizado.
    return await this.comentarioRepository.save(comentario);
  }

  // Elimina físicamente un comentario después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el comentario que se desea eliminar.
    const comentario: Comentario = await this.findOne(id);

    // Elimina el comentario de la base de datos.
    await this.comentarioRepository.remove(comentario);
  }
}
