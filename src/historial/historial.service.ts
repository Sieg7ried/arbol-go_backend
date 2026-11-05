// Importa la excepción utilizada cuando no se encuentra un registro.
import { Injectable, NotFoundException } from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar historiales.
import { CreateHistorialDto } from './dto/create-historial.dto';
import { UpdateHistorialDto } from './dto/update-historial.dto';

// Importa la entidad principal del módulo.
import { Historial } from './entities/historial.entity';

// Importa el servicio central de árboles para sincronizar las medidas actuales.
import { ArbolService } from '../arbol/arbol.service';

// Declara el servicio que contiene la lógica de negocio de los historiales.
@Injectable()
export class HistorialService {
  // Configura los repositorios necesarios para operar con historiales y árboles.
  constructor(
    // Inyecta el repositorio de historiales.
    @InjectRepository(Historial)
    private readonly historialRepository: Repository<Historial>,

    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,

    // Permite actualizar la ficha actual del árbol después de guardar la medición.
    private readonly arbolService: ArbolService,
  ) {}

  // Crea un historial después de validar que exista el árbol relacionado.
  async create(createHistorialDto: CreateHistorialDto): Promise<Historial> {
    // Busca el árbol asociado al historial.
    const arbol: Arbol | null = await this.arbolRepository.findOneBy({
      id_arbol: createHistorialDto.id_arbol,
    });

    // Informa si el árbol relacionado no existe.
    if (!arbol) {
      throw new NotFoundException(
        `Árbol con ID ${createHistorialDto.id_arbol} no encontrado`,
      );
    }

    // Separa la FK y la fecha para asignarlas con el formato correcto.
    const {
      id_arbol: _idArbol,
      fecha,
      ...historialData
    } = createHistorialDto;

    // Crea una instancia de historial con la relación validada.
    const historial: Historial = this.historialRepository.create({
      ...historialData,
      id_arbol: arbol.id_arbol,
      arbol,
      fecha: new Date(fecha),
    });

    // Guarda primero la medición histórica para conservar el registro original.
    const historialGuardado = await this.historialRepository.save(historial);

    // Sincroniza altura y diámetro con la ficha actual del árbol.
    await this.arbolService.update(arbol.id_arbol, {
      altura_actual: createHistorialDto.altura,
      diametro_tronco: createHistorialDto.diametro,
    });

    // Devuelve el historial después de completar la sincronización inter-servicio.
    return historialGuardado;
  }

  // Obtiene todos los historiales incluyendo el árbol relacionado.
  async findAll(): Promise<Historial[]> {
    // Consulta todos los historiales junto con su árbol.
    return await this.historialRepository.find({
      relations: {
        arbol: true,
      },
    });
  }

  // Obtiene un historial específico por su identificador.
  async findOne(id: number): Promise<Historial> {
    // Busca el historial por su clave primaria e incluye el árbol relacionado.
    const historial: Historial | null = await this.historialRepository.findOne({
      where: { id_historial: id },
      relations: {
        arbol: true,
      },
    });

    // Informa si no existe un historial con el identificador recibido.
    if (!historial) {
      throw new NotFoundException(`Historial con ID ${id} no encontrado`);
    }

    // Devuelve el historial encontrado.
    return historial;
  }

  // Actualiza un historial y valida el árbol si se modifica la relación.
  async update(
    id: number,
    updateHistorialDto: UpdateHistorialDto,
  ): Promise<Historial> {
    // Busca el historial que se desea actualizar.
    const historial: Historial = await this.findOne(id);

    // Copia los cambios recibidos para procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateHistorialDto,
    };

    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateHistorialDto.id_arbol !== undefined) {
      // Impide transferir un historial a un árbol potencialmente ajeno.
      throw new NotFoundException(
        'No puedes cambiar el árbol asociado al historial',
      );
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateHistorialDto.fecha !== undefined) {
      changes.fecha = new Date(updateHistorialDto.fecha);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.historialRepository.merge(
      historial,
      changes as Partial<Historial>,
    );

    // Guarda el historial actualizado antes de sincronizar sus medidas.
    const historialGuardado = await this.historialRepository.save(historial);

    // Construye solo las medidas realmente proporcionadas en el PATCH.
    const medidas: Partial<{
      altura_actual: number;
      diametro_tronco: number;
    }> = {};

    // Sincroniza altura cuando el historial trae una nueva medición.
    if (updateHistorialDto.altura !== undefined) {
      medidas.altura_actual = updateHistorialDto.altura;
    }

    // Sincroniza diámetro cuando el historial trae una nueva medición.
    if (updateHistorialDto.diametro !== undefined) {
      medidas.diametro_tronco = updateHistorialDto.diametro;
    }

    // Ejecuta la sincronización inter-servicio solo si hubo medidas nuevas.
    if (Object.keys(medidas).length > 0) {
      await this.arbolService.update(historial.id_arbol, medidas);
    }

    // Devuelve el historial una vez finalizadas ambas persistencias.
    return historialGuardado;
  }

  // Elimina físicamente un historial después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca el historial que se desea eliminar.
    const historial: Historial = await this.findOne(id);

    // Elimina el historial de la base de datos.
    await this.historialRepository.remove(historial);
  }
}
