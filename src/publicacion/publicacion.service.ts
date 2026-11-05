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

// Importa la entidad principal del módulo.
import { Publicacion } from './entities/publicacion.entity';

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

    // Separa la FK y la fecha para asignarlas con el formato correcto.
    const {
      id_usuario: _idUsuario,
      fecha,
      ...publicacionData
    } = createPublicacionDto;

    // Crea una instancia de publicación con la relación validada.
    const publicacion: Publicacion = this.publicacionRepository.create({
      ...publicacionData,
      id_usuario: usuario.id,
      usuario,
      fecha: new Date(fecha),
    });

    // Guarda la publicación y devuelve el registro persistido.
    return await this.publicacionRepository.save(publicacion);
  }

  // Obtiene todas las publicaciones incluyendo el usuario relacionado.
  async findAll(): Promise<Publicacion[]> {
    // Consulta todas las publicaciones junto con su usuario.
    return await this.publicacionRepository.find({
      relations: {
        usuario: true,
      },
    });
  }

  // Obtiene una publicación específica por su identificador.
  async findOne(id: number): Promise<Publicacion> {
    // Busca la publicación por su clave primaria e incluye el usuario relacionado.
    const publicacion: Publicacion | null =
      await this.publicacionRepository.findOne({
        where: { id_publicacion: id },
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

    // Convierte la fecha recibida a una instancia de Date.
    if (updatePublicacionDto.fecha !== undefined) {
      changes.fecha = new Date(updatePublicacionDto.fecha);
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

    // Elimina la publicación de la base de datos.
    await this.publicacionRepository.remove(publicacion);
  }

  // Marca una publicación para que un administrador pueda revisarla.
  async report(id: number): Promise<Publicacion> {
    // Busca la publicación antes de modificar su estado de moderación.
    const publicacion = await this.findOne(id);

    // Registra el reporte y la fecha UTC del evento.
    publicacion.reportado = true;
    publicacion.fecha_reporte = new Date();

    // Persiste el reporte sin alterar la autoría de la publicación.
    return await this.publicacionRepository.save(publicacion);
  }

  // Elimina una publicación únicamente si fue reportada previamente.
  async removeReportedByAdmin(id: number): Promise<void> {
    // Obtiene el recurso y sus relaciones mediante el método CRUD existente.
    const publicacion = await this.findOne(id);

    // Impide que un administrador use la ruta de moderación como borrado general.
    if (!publicacion.reportado) {
      throw new ForbiddenException(
        'Solo pueden moderarse publicaciones reportadas',
      );
    }

    // Elimina el recurso después de superar la condición de moderación.
    await this.publicacionRepository.remove(publicacion);
  }
}
