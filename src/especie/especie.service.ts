import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Especie } from './entities/especie.entity';
import { CreateEspecieDto } from './dto/create-especie.dto';
import { UpdateEspecieDto } from './dto/update-especie.dto';

@Injectable()
export class EspecieService {
  constructor(
    // Inyecta el repositorio que consulta y persiste las especies.
    @InjectRepository(Especie)
    private readonly especieRepository: Repository<Especie>,
  ) {}

  // Evita duplicar el nombre común antes de guardar una especie.
  async create(createEspecieDto: CreateEspecieDto): Promise<Especie> {
    // Busca el mismo nombre común para devolver un conflicto comprensible.
    const existe: boolean = await this.especieRepository.existsBy({
      nombreComun: createEspecieDto.nombreComun,
    });

    if (existe) {
      throw new ConflictException('La especie ya está registrada');
    }

    // Crea la instancia con los campos que ya validó el DTO.
    const especie: Especie = this.especieRepository.create(createEspecieDto);

    // Persiste la especie y devuelve el registro creado.
    return await this.especieRepository.save(especie);
  }

  // Devuelve todas las especies registradas en el catálogo.
  async findAll(): Promise<Especie[]> {
    return await this.especieRepository.find();
  }

  // Busca una especie por ID y devuelve 404 solo cuando no existe.
  async findOne(id: number): Promise<Especie> {
    const especie: Especie | null = await this.especieRepository.findOneBy({ id });

    if (!especie) {
      throw new NotFoundException(`Especie con ID ${id} no encontrada`);
    }

    return especie;
  }

  // Aplica los campos parciales validados a una especie existente.
  async update(id: number, updateEspecieDto: UpdateEspecieDto): Promise<Especie> {
    const especie: Especie = await this.findOne(id);

    // Copia los cambios para no modificar el DTO recibido.
    const changes: UpdateEspecieDto = { ...updateEspecieDto };

    // Fusiona los campos actualizables con la entidad encontrada.
    this.especieRepository.merge(especie, changes);

    return await this.especieRepository.save(especie);
  }

  // Elimina la especie y convierte únicamente la referencia FK conocida en 409.
  async remove(id: number): Promise<void> {
    const especie: Especie = await this.findOne(id);

    try {
      await this.especieRepository.remove(especie);
    } catch (error: unknown) {
      // MySQL devuelve este código cuando un árbol todavía referencia la especie.
      const driverError =
        error instanceof QueryFailedError ? error.driverError : null;

      // MySQL devuelve este código cuando un árbol todavía referencia la especie.
      if (
        driverError !== null &&
        typeof driverError === 'object' &&
        'code' in driverError &&
        driverError.code === 'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new ConflictException(
          'No se puede eliminar la especie porque todavía tiene árboles asociados.',
        );
      }

      // Propaga errores distintos para no ocultar fallos de base de datos.
      throw error;
    }
  }
}