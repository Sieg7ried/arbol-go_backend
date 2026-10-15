import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Especie } from './entities/especie.entity';
import { CreateEspecieDto } from './dto/create-especie.dto';
import { UpdateEspecieDto } from './dto/update-especie.dto';

@Injectable()
export class EspecieService {
  // Número de rondas de encriptación de bcrypt
  private readonly saltRounds = 10;

  constructor(
    // Inyección del repositorio de Especie
    @InjectRepository(Especie)
    private readonly especieRepository: Repository<Especie>,
  ) {}

  /**
   * Crear una nueva especie
   * Lanza 409 si ya existe una especie con el mismo nombre común
   */
  async create(createEspecieDto: CreateEspecieDto): Promise<Especie> {
    // Verificar si la especie ya existe
    const especieExists: boolean = await this.especieRepository.existsBy({
      nombreComun: createEspecieDto.nombreComun,
    });

    if (especieExists) {
      throw new ConflictException('La especie ya está registrada');
    }

    // Crear nueva instancia de especie
    const especie: Especie = this.especieRepository.create(createEspecieDto);

    // Guardar en la base de datos
    return await this.especieRepository.save(especie);
  }

  /**
   * Obtener todos las especies
   */
  async findAll(): Promise<Especie[]> {
    return await this.especieRepository.find();
  }

  /**
   * Obtener una especie por ID
   * Lanza 404 si no existe (para uso en controladores)
   */
  async findOne(id: number): Promise<Especie> {
    const especie: Especie | null = await this.especieRepository.findOneBy({ id });

    if (!especie) {
      throw new NotFoundException(`Especie con ID ${id} no encontrada`);
    }

    return especie;
  }

  /**
   * Buscar una especie por ID sin lanzar excepción
   * Devuelve null si no existe (lo usa la estrategia JWT)
   */
  async findById(id: number): Promise<Especie | null> {
    return await this.especieRepository.findOneBy({ id });
  }

  /**
   * Actualizar una especie
   */
  async update(id: number, updateEspecieDto: UpdateEspecieDto): Promise<Especie> {
    const especie: Especie = await this.findOne(id);

    // Copia de los cambios para no modificar el DTO recibido
    const changes: UpdateEspecieDto = { ...updateEspecieDto };

    // Combinar los cambios con la entidad existente
    this.especieRepository.merge(especie, changes);

    return await this.especieRepository.save(especie);
  }

  /**
   * Eliminar una especie (borrado físico del registro)
   */
  async remove(id: number): Promise<void> {
    const especie: Especie = await this.findOne(id);
    await this.especieRepository.remove(especie);
  }
}