import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logro } from './entities/logro.entity';
import { CreateLogroDto } from './dto/create-logro.dto';
import { UpdateLogroDto } from './dto/update-logro.dto';

@Injectable()
export class LogroService {
  constructor(
    // Inyección del repositorio de Logro
    @InjectRepository(Logro)
    private readonly logroRepository: Repository<Logro>,
  ) {}

  /**
   * Crear un nuevo logro
   */
  async create(createLogroDto: CreateLogroDto): Promise<Logro> {
    const logro: Logro = this.logroRepository.create(createLogroDto);
    return await this.logroRepository.save(logro);
  }

  /**
   * Obtener todos los logros
   */
  async findAll(): Promise<Logro[]> {
    return await this.logroRepository.find();
  }

  /**
   * Obtener un logro por ID
   * Lanza 404 si no existe
   */
  async findOne(id: number): Promise<Logro> {
    const logro: Logro | null = await this.logroRepository.findOneBy({ id });

    if (!logro) {
      throw new NotFoundException(`Logro con ID ${id} no encontrado`);
    }

    return logro;
  }

  /**
   * Actualizar un logro
   */
  async update(id: number, updateLogroDto: UpdateLogroDto): Promise<Logro> {
    const logro: Logro = await this.findOne(id);

    // Combinar los cambios con la entidad existente
    this.logroRepository.merge(logro, updateLogroDto);

    return await this.logroRepository.save(logro);
  }

  /**
   * Eliminar un logro (borrado físico del registro)
   */
  async remove(id: number): Promise<void> {
    const logro: Logro = await this.findOne(id);
    await this.logroRepository.remove(logro);
  }
}
