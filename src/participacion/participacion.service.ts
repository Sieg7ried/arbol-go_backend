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

// Importa la entidad EventoAmbiental para validar la relación correspondiente.
import { EventoAmbiental } from '../evento-ambiental/entities/evento-ambiental.entity';

// Importa los DTO utilizados para crear y actualizar participaciones.
import { CreateParticipacionDto } from './dto/create-participacion.dto';
import { UpdateParticipacionDto } from './dto/update-participacion.dto';

// Importa la entidad principal del módulo.
import { Participacion } from './entities/participacion.entity';

// Declara el servicio que contiene la lógica de negocio de las participaciones.
@Injectable()
export class ParticipacionService {
  // Configura los repositorios necesarios para operar con usuarios, eventos y participaciones.
  constructor(
    // Inyecta el repositorio de participaciones.
    @InjectRepository(Participacion)
    private readonly participacionRepository: Repository<Participacion>,

    // Inyecta el repositorio de usuarios.
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    // Inyecta el repositorio de eventos ambientales.
    @InjectRepository(EventoAmbiental)
    private readonly eventoRepository: Repository<EventoAmbiental>,
  ) {}

  // Crea una participación después de validar sus relaciones.
  async create(
    createParticipacionDto: CreateParticipacionDto,
  ): Promise<Participacion> {
    // Busca el usuario asociado.
    const usuario: User | null = await this.userRepository.findOneBy({
      id: createParticipacionDto.id_usuario,
    });

    // Informa si el usuario relacionado no existe.
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con ID ${createParticipacionDto.id_usuario} no encontrado`,
      );
    }

    // Busca el evento ambiental asociado.
    const evento: EventoAmbiental | null =
      await this.eventoRepository.findOneBy({
        id: createParticipacionDto.id_evento,
      });

    // Informa si el evento relacionado no existe.
    if (!evento) {
      throw new NotFoundException(
        `Evento con ID ${createParticipacionDto.id_evento} no encontrado`,
      );
    }

    // Comprueba si la participación ya está registrada.
    const existingParticipation: Participacion | null =
      await this.participacionRepository.findOneBy({
        id_usuario: createParticipacionDto.id_usuario,
        id_evento: createParticipacionDto.id_evento,
      });

    // Evita duplicar la combinación de usuario y evento.
    if (existingParticipation) {
      throw new ConflictException(
        'El usuario ya está registrado en este evento',
      );
    }

    // Separa las claves foráneas y la fecha para asignar las relaciones validadas.
    const {
      id_usuario: _idUsuario,
      id_evento: _idEvento,
      fecha_inscripcion,
      ...participacionData
    } = createParticipacionDto;

    // Crea la participación con sus relaciones validadas.
    const participacion: Participacion =
      this.participacionRepository.create({
        ...participacionData,
        id_usuario: usuario.id,
        id_evento: evento.id,
        usuario,
        evento,
        fecha_inscripcion: new Date(fecha_inscripcion),
      });

    // Guarda la participación y devuelve el registro persistido.
    return await this.participacionRepository.save(participacion);
  }

  // Obtiene todas las participaciones incluyendo usuario y evento.
  async findAll(): Promise<Participacion[]> {
    // Consulta todos los registros junto con sus relaciones.
    return await this.participacionRepository.find({
      relations: {
        usuario: true,
        evento: true,
      },
    });
  }

  // Obtiene una participación por la clave primaria compuesta.
  async findOne(
    id_usuario: number,
    id_evento: number,
  ): Promise<Participacion> {
    // Busca la participación utilizando ambos identificadores.
    const participacion: Participacion | null =
      await this.participacionRepository.findOne({
        where: {
          id_usuario,
          id_evento,
        },
        relations: {
          usuario: true,
          evento: true,
        },
      });

    // Informa si no existe la participación solicitada.
    if (!participacion) {
      throw new NotFoundException(
        `Participación del usuario ${id_usuario} en el evento ${id_evento} no encontrada`,
      );
    }

    // Devuelve el registro encontrado.
    return participacion;
  }

  // Actualiza una participación y valida sus relaciones si cambian.
  async update(
    id_usuario: number,
    id_evento: number,
    updateParticipacionDto: UpdateParticipacionDto,
  ): Promise<Participacion> {
    // Busca el registro que se desea actualizar.
    const participacion: Participacion = await this.findOne(
      id_usuario,
      id_evento,
    );

    // Copia los cambios recibidos para no modificar el DTO original.
    const changes: Record<string, unknown> = {
      ...updateParticipacionDto,
    };

    // Comprueba si se solicitó cambiar el usuario relacionado.
    if (updateParticipacionDto.id_usuario !== undefined) {
      // Busca el nuevo usuario.
      const usuario: User | null = await this.userRepository.findOneBy({
        id: updateParticipacionDto.id_usuario,
      });

      // Informa si el nuevo usuario no existe.
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con ID ${updateParticipacionDto.id_usuario} no encontrado`,
        );
      }

      // Asigna el usuario validado y actualiza la FK.
      participacion.usuario = usuario;
      participacion.id_usuario = usuario.id;

      // Evita enviar el identificador como cambio independiente.
      delete changes.id_usuario;
    }

    // Comprueba si se solicitó cambiar el evento relacionado.
    if (updateParticipacionDto.id_evento !== undefined) {
      // Busca el nuevo evento.
      const evento: EventoAmbiental | null =
        await this.eventoRepository.findOneBy({
          id: updateParticipacionDto.id_evento,
        });

      // Informa si el nuevo evento no existe.
      if (!evento) {
        throw new NotFoundException(
          `Evento con ID ${updateParticipacionDto.id_evento} no encontrado`,
        );
      }

      // Asigna el evento validado y actualiza la FK.
      participacion.evento = evento;
      participacion.id_evento = evento.id;

      // Evita enviar el identificador como cambio independiente.
      delete changes.id_evento;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateParticipacionDto.fecha_inscripcion !== undefined) {
      changes.fecha_inscripcion = new Date(
        updateParticipacionDto.fecha_inscripcion,
      );
    }

    // Comprueba que la nueva combinación no duplique otro registro.
    if (
      participacion.id_usuario !== id_usuario ||
      participacion.id_evento !== id_evento
    ) {
      // Busca otra participación con la nueva clave compuesta.
      const duplicateParticipation: Participacion | null =
        await this.participacionRepository.findOneBy({
          id_usuario: participacion.id_usuario,
          id_evento: participacion.id_evento,
        });

      // Evita guardar una combinación duplicada.
      if (duplicateParticipation) {
        throw new ConflictException(
          'La nueva combinación de usuario y evento ya está registrada',
        );
      }
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.participacionRepository.merge(
      participacion,
      changes as Partial<Participacion>,
    );

    // Guarda y devuelve la participación actualizada.
    return await this.participacionRepository.save(participacion);
  }

  // Elimina una participación después de comprobar que existe.
  async remove(id_usuario: number, id_evento: number): Promise<void> {
    // Busca el registro que se desea eliminar.
    const participacion: Participacion = await this.findOne(
      id_usuario,
      id_evento,
    );

    // Elimina la participación de la base de datos.
    await this.participacionRepository.remove(participacion);
  }
}
