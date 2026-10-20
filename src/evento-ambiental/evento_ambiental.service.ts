// evento-ambiental.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventoAmbiental } from './entities/evento-ambiental.entity';
import { CreateEventoAmbientalDto } from './dto/create-evento-ambiental.dto';
import { UpdateEventoAmbientalDto } from './dto/update-evento-ambiental.dto';

@Injectable()
export class EventoAmbientalService {
  constructor(
    @InjectRepository(EventoAmbiental)
    private readonly eventoRepository: Repository<EventoAmbiental>,
  ) {}

  async create(dto: CreateEventoAmbientalDto): Promise<EventoAmbiental> {
    const exists: boolean = await this.eventoRepository.existsBy({
      nombre: dto.nombre,
      fecha: dto.fecha,
    });

    if (exists) {
      throw new ConflictException(
        'Ya existe un evento con ese nombre en esa fecha',
      );
    }

    const evento: EventoAmbiental = this.eventoRepository.create(dto);
    return await this.eventoRepository.save(evento);
  }

  async findAll(): Promise<EventoAmbiental[]> {
    // Los más próximos primero
    return await this.eventoRepository.find({ order: { fecha: 'ASC' } });
  }

  async findOne(id: number): Promise<EventoAmbiental> {
    const evento: EventoAmbiental | null =
      await this.eventoRepository.findOneBy({ id });

    if (!evento) {
      throw new NotFoundException(`Evento ambiental con ID ${id} no encontrado`);
    }
    return evento;
  }

  async update(
    id: number,
    dto: UpdateEventoAmbientalDto,
  ): Promise<EventoAmbiental> {
    const evento: EventoAmbiental = await this.findOne(id);
    this.eventoRepository.merge(evento, dto);
    return await this.eventoRepository.save(evento);
  }

  async remove(id: number): Promise<void> {
    const evento: EventoAmbiental = await this.findOne(id);
    await this.eventoRepository.remove(evento);
  }
}