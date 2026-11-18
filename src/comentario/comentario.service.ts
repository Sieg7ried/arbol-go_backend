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

// Importa la entidad User para validar la relación correspondiente.
import { User } from '../user/entities/user.entity';

// Importa la entidad Publicacion para validar la relación correspondiente.
import { Publicacion } from '../publicacion/entities/publicacion.entity';

// Importa los DTO utilizados para crear y actualizar comentarios.
import { CreateComentarioDto } from './dto/create-comentario.dto';
import { UpdateComentarioDto } from './dto/update-comentario.dto';
import { CreateReporteDto } from '../reporte/dto/create-reporte.dto';

// Importa la entidad principal del módulo.
import { Comentario } from './entities/comentario.entity';
import { Reporte } from '../reporte/entities/reporte.entity';
import { ReporteService } from '../reporte/reporte.service';

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

    // Inyecta el servicio común que registra reportes y aplica el umbral atómicamente.
    private readonly reporteService: ReporteService,
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

    // Separa las claves foráneas para asignar las relaciones validadas.
    // TypeORM genera automáticamente la fecha de creación al persistir.
    const {
      id_usuario: _idUsuario,
      id_publicacion: _idPublicacion,
      ...comentarioData
    } = createComentarioDto;

    // Crea una instancia con las relaciones previamente validadas.
    const comentario: Comentario = this.comentarioRepository.create({
      ...comentarioData,
      id_usuario: usuario.id,
      usuario,
      id_publicacion: publicacion.id_publicacion,
      publicacion,
    });

    // Guarda el comentario y devuelve el registro persistido.
    return await this.comentarioRepository.save(comentario);
  }

  // Obtiene todos los comentarios incluyendo usuario y publicación.
  async findAll(): Promise<Comentario[]> {
    // Expone comentarios visibles y excluye también los de publicaciones ocultas.
    return await this.comentarioRepository.find({
      where: {
        estado_moderacion: 'visible',
        publicacion: { estado_moderacion: 'visible' },
      },
      relations: {
        usuario: true,
        publicacion: true,
      },
    });
  }

  // Obtiene un comentario específico por su identificador.
  async findOne(id: number): Promise<Comentario> {
    // Busca solo comentarios visibles ligados a publicaciones visibles.
    const comentario: Comentario | null =
      await this.comentarioRepository.findOne({
        where: {
          id_comentario: id,
          estado_moderacion: 'visible',
          publicacion: { estado_moderacion: 'visible' },
        },
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
      // Impide transferir la autoría del comentario desde el DTO.
      throw new ForbiddenException(
        'No puedes cambiar el autor del comentario',
      );
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

  // Registra el reporte del usuario autenticado y delega el conteo transaccional.
  async report(
    id: number,
    usuarioId: number,
    dto: CreateReporteDto,
  ): Promise<Reporte> {
    // El servicio compartido bloquea el objetivo, impide duplicados y aplica el umbral.
    return this.reporteService.reportarComentario(id, usuarioId, dto.motivo);
  }

  // Permite que la moderación administrativa elimine únicamente contenido oculto.
  async removeReportedByAdmin(id: number): Promise<void> {
    // Incluye el comentario oculto, que no puede recuperarse mediante findOne público.
    const comentario = await this.comentarioRepository.findOneBy({
      id_comentario: id,
    });

    // Informa si el comentario no existe.
    if (!comentario) {
      throw new NotFoundException(`Comentario con ID ${id} no encontrado`);
    }

    // Impide que la ruta administrativa borre contenido que no llegó a moderación.
    if (comentario.estado_moderacion !== 'oculto') {
      throw new ForbiddenException(
        'Solo pueden eliminarse comentarios ocultos para moderación',
      );
    }

    // Elimina el comentario después de validar la condición administrativa.
    await this.comentarioRepository.remove(comentario);
  }
}
