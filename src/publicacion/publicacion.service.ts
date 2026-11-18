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

// Importa los DTO utilizados para crear y actualizar publicaciones.
import { CreatePublicacionDto } from './dto/create-publicacion.dto';
import { UpdatePublicacionDto } from './dto/update-publicacion.dto';
import { CreateReporteDto } from '../reporte/dto/create-reporte.dto';

// Importa la entidad principal del módulo.
import { Publicacion } from './entities/publicacion.entity';
import { Reporte } from '../reporte/entities/reporte.entity';
import { ReporteService } from '../reporte/reporte.service';
import type { PaginationDto } from '../common/dto/pagination.dto';
import type { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { paginateRepository } from '../common/pagination.util';

// Declara el servicio que contiene la lógica de negocio de las publicaciones.
@Injectable()
export class PublicacionService {
  // Configura los repositorios necesarios para operar con publicaciones y usuarios.
  constructor(
    // Inyecta el repositorio de publicaciones.
    @InjectRepository(Publicacion)
    private readonly publicacionRepository: Repository<Publicacion>,

    // Inyecta el repositorio de usuarios.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Inyecta el servicio común que registra reportes y aplica el umbral atómicamente.
    private readonly reporteService: ReporteService,
  ) {}

  // Crea una publicación después de validar que exista el usuario relacionado.
  async create(
    createPublicacionDto: CreatePublicacionDto,
  ): Promise<Publicacion> {
    // Busca el usuario asociado a la publicación.
    const usuario: User | null = await this.userRepository.findOneBy({
      id: createPublicacionDto.id_usuario,
    });

    // Informa si el usuario relacionado no existe.
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createPublicacionDto.id_usuario} no encontrado`,
      );
    }

    // Separa la FK para asignar el usuario validado; TypeORM genera la fecha.
    const { id_usuario: _idUsuario, ...publicacionData } =
      createPublicacionDto;

    // Crea una instancia de publicación con la relación validada.
    const publicacion: Publicacion = this.publicacionRepository.create({
      ...publicacionData,
      id_usuario: usuario.id,
      usuario,
    });

    // Guarda la publicación y devuelve el registro persistido.
    return await this.publicacionRepository.save(publicacion);
  }

  // Obtiene una página de publicaciones visibles y el total disponible.
  async findAll(
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Publicacion>> {
    // Conserva el filtro de moderación y aplica paginación al conjunto visible.
    return paginateRepository(this.publicacionRepository, pagination, {
      where: { estado_moderacion: 'visible' },
      relations: {
        usuario: true,
      },
    });
  }

  // Devuelve solo publicaciones visibles del usuario autenticado.
  async findMine(
    usuarioId: number,
    pagination: PaginationDto,
  ): Promise<PaginatedResult<Publicacion>> {
    // Aplica propiedad y moderación en la consulta antes de calcular la página.
    return paginateRepository(this.publicacionRepository, pagination, {
      where: {
        id_usuario: usuarioId,
        estado_moderacion: 'visible',
      },
      relations: {
        usuario: true,
      },
    });
  }

  // Obtiene una publicación específica por su identificador.
  async findOne(id: number): Promise<Publicacion> {
    // Busca únicamente publicaciones visibles para no revelar contenido oculto por ID.
    const publicacion: Publicacion | null =
      await this.publicacionRepository.findOne({
        where: { id_publicacion: id, estado_moderacion: 'visible' },
        relations: {
          usuario: true,
        },
      });

    // Informa si no existe una publicación con el identificador recibido.
    if (!publicacion) {
      throw new NotFoundException(
        `Publicación con ID ${id} no encontrada`,
      );
    }

    // Devuelve la publicación encontrada.
    return publicacion;
  }

  // Actualiza una publicación y valida el usuario si se modifica la relación.
  async update(
    id: number,
    updatePublicacionDto: UpdatePublicacionDto,
  ): Promise<Publicacion> {
    // Busca la publicación que se desea actualizar.
    const publicacion: Publicacion = await this.findOne(id);

    // Copia los cambios recibidos para no modificar el DTO original.
    const changes: Record<string, unknown> = {
      ...updatePublicacionDto,
    };

    // Comprueba si se solicitó cambiar el usuario relacionado.
    if (updatePublicacionDto.id_usuario !== undefined) {
      // Impide transferir la autoría mediante datos controlados por el cliente.
      throw new ForbiddenException(
        'No puedes cambiar el autor de la publicación',
      );
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.publicacionRepository.merge(
      publicacion,
      changes as Partial<Publicacion>,
    );

    // Guarda y devuelve la publicación actualizada.
    return await this.publicacionRepository.save(publicacion);
  }

  // Elimina físicamente una publicación después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca la publicación que se desea eliminar.
    const publicacion: Publicacion = await this.findOne(id);

    // La FK CASCADE elimina atómicamente sus comentarios antes de que la
    // publicación desaparezca, sin propagar un error de clave foránea.
    await this.publicacionRepository.remove(publicacion);
  }

  // Registra el reporte del usuario autenticado y delega el conteo transaccional.
  async report(
    id: number,
    usuarioId: number,
    dto: CreateReporteDto,
  ): Promise<Reporte> {
    // El servicio compartido bloquea el objetivo, impide duplicados y aplica el umbral.
    return this.reporteService.reportarPublicacion(id, usuarioId, dto.motivo);
  }

  // Permite que la moderación administrativa elimine únicamente contenido oculto.
  async removeReportedByAdmin(id: number): Promise<void> {
    // Incluye el contenido oculto, que no puede recuperarse mediante findOne público.
    const publicacion = await this.publicacionRepository.findOneBy({
      id_publicacion: id,
    });

    // Informa si la publicación no existe.
    if (!publicacion) {
      throw new NotFoundException(`Publicación con ID ${id} no encontrada`);
    }

    // Impide que la ruta administrativa borre contenido que no llegó a moderación.
    if (publicacion.estado_moderacion !== 'oculto') {
      throw new ForbiddenException(
        'Solo pueden eliminarse publicaciones ocultas para moderación',
      );
    }

    // La FK CASCADE elimina también los comentarios de esta publicación reportada.
    await this.publicacionRepository.remove(publicacion);
  }
}
