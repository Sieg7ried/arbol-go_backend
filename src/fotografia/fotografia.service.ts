// Importa la excepción utilizada cuando no se encuentra un registro.
import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// Importa el decorador para inyectar repositorios de TypeORM.
import { InjectRepository } from '@nestjs/typeorm';

// Importa el repositorio genérico utilizado para consultar y guardar entidades.
import { Repository } from 'typeorm';

// Importa la entidad Arbol para validar la relación correspondiente.
import { Arbol } from '../arbol/entities/arbol.entity';

// Importa los DTO utilizados para crear y actualizar fotografías.
import { CreateFotografiaDto } from './dto/create-fotografia.dto';
import { UpdateFotografiaDto } from './dto/update-fotografia.dto';

// Importa la entidad principal del módulo.
import { Fotografia } from './entities/fotografia.entity';

// Importa el servicio que almacena imágenes fuera de la base de datos.
import { CloudinaryService } from '../cloudinary/cloudinary.service';

// Importa el tipo de archivo recibido por Multer.
import type { Express } from 'express';

// Declara el servicio que contiene la lógica de negocio de las fotografías.
@Injectable()
export class FotografiaService {
  // Configura los repositorios necesarios para operar con fotografías y árboles.
  constructor(
    // Inyecta el repositorio de fotografías.
    @InjectRepository(Fotografia)
    private readonly fotografiaRepository: Repository<Fotografia>,

    // Inyecta el repositorio de árboles.
    @InjectRepository(Arbol)
    private readonly arbolRepository: Repository<Arbol>,

    // Centraliza la subida y la obtención de secure_url.
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Crea una fotografía después de validar que exista el árbol relacionado.
  async create(
    createFotografiaDto: CreateFotografiaDto,
    file: Express.Multer.File,
  ): Promise<Fotografia> {
    // Busca el árbol asociado a la fotografía.
    const arbol: Arbol | null = await this.arbolRepository.findOneBy({
      id_arbol: createFotografiaDto.id_arbol,
    });

    // Informa si el árbol relacionado no existe.
    if (!arbol) {
      throw new NotFoundException(
        `Árbol con ID ${createFotografiaDto.id_arbol} no encontrado`,
      );
    }

    // Obtiene URL y public_id de la respuesta de subida del SDK.
    const uploadedImage = await this.cloudinaryService.uploadImage(file);

    // Separa la FK, la URL controlada por el cliente y la fecha.
    const {
      id_arbol: _idArbol,
      url_imagen: _clientUrl,
      fecha,
      ...fotografiaData
    } = createFotografiaDto;

    // Crea una instancia de fotografía con la relación validada.
    const fotografia: Fotografia = this.fotografiaRepository.create({
      ...fotografiaData,
      id_arbol: arbol.id_arbol,
      arbol,
      url_imagen: uploadedImage.secure_url,
      public_id: uploadedImage.public_id,
      fecha: new Date(fecha),
    });

    // Guarda la fotografía y devuelve el registro persistido.
    return await this.fotografiaRepository.save(fotografia);
  }

  // Obtiene todas las fotografías incluyendo el árbol relacionado.
  async findAll(): Promise<Fotografia[]> {
    // Consulta todas las fotografías junto con su árbol.
    return await this.fotografiaRepository.find({
      relations: {
        arbol: true,
      },
    });
  }

  // Obtiene una fotografía específica por su identificador.
  async findOne(id: number): Promise<Fotografia> {
    // Busca la fotografía por su clave primaria e incluye el árbol relacionado.
    const fotografia: Fotografia | null =
      await this.fotografiaRepository.findOne({
        where: { id_foto: id },
        relations: {
          arbol: true,
        },
      });

    // Informa si no existe una fotografía con el identificador recibido.
    if (!fotografia) {
      throw new NotFoundException(`Fotografía con ID ${id} no encontrada`);
    }

    // Devuelve la fotografía encontrada.
    return fotografia;
  }

  // Actualiza una fotografía y valida el árbol si se modifica la relación.
  async update(
    id: number,
    updateFotografiaDto: UpdateFotografiaDto,
    file?: Express.Multer.File,
  ): Promise<Fotografia> {
    // Busca la fotografía que se desea actualizar.
    const fotografia: Fotografia = await this.findOne(id);

    // Copia los cambios recibidos para procesarlos sin modificar el DTO.
    const changes: Record<string, unknown> = {
      ...updateFotografiaDto,
    };

    // Comprueba si se solicitó cambiar el árbol relacionado.
    if (updateFotografiaDto.id_arbol !== undefined) {
      // Impide transferir la fotografía a un árbol de otro propietario.
      throw new ForbiddenException(
        'No puedes cambiar el árbol propietario de la fotografía',
      );
    }

    // Impide que el cliente sustituya una URL sin pasar por Cloudinary.
    delete changes.url_imagen;

    let previousPublicId: string | null = null;

    if (file) {
      // Impide reemplazar una fila antigua si no hay public_id con el que limpiar la imagen previa.
      if (!fotografia.public_id) {
        throw new ConflictException(
          'La fotografía no tiene public_id de Cloudinary; debe reconciliarse antes de reemplazarla',
        );
      }

      previousPublicId = fotografia.public_id;

      // Extrae el nuevo public_id y URL de la respuesta del SDK.
      const uploadedImage = await this.cloudinaryService.uploadImage(file);
      changes.url_imagen = uploadedImage.secure_url;
      changes.public_id = uploadedImage.public_id;
    }

    // Convierte la fecha recibida a una instancia de Date.
    if (updateFotografiaDto.fecha !== undefined) {
      changes.fecha = new Date(updateFotografiaDto.fecha);
    }

    // Aplica los cambios restantes sobre la entidad existente.
    this.fotografiaRepository.merge(
      fotografia,
      changes as Partial<Fotografia>,
    );

    // Primero persiste la nueva referencia para no dejar la fila apuntando a una imagen borrada.
    const updatedFotografia =
      await this.fotografiaRepository.save(fotografia);

    if (previousPublicId) {
      // Limpia la imagen anterior en Cloudinary después de confirmar el reemplazo en la BD.
      await this.cloudinaryService.deleteImage(previousPublicId);
    }

    return updatedFotografia;
  }

  // Elimina físicamente una fotografía después de comprobar que existe.
  async remove(id: number): Promise<void> {
    // Busca la fotografía que se desea eliminar.
    const fotografia: Fotografia = await this.findOne(id);

    if (!fotografia.public_id) {
      throw new ConflictException(
        'La fotografía no tiene public_id de Cloudinary; debe reconciliarse antes de eliminarla',
      );
    }

    // Limpia primero el recurso remoto; si Cloudinary falla, la fila sigue disponible.
    await this.cloudinaryService.deleteImage(fotografia.public_id);

    // Elimina la fotografía de la base de datos.
    await this.fotografiaRepository.remove(fotografia);
  }
}
