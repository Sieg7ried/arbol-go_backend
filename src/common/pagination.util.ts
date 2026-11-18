import { Repository } from 'typeorm';
import type { FindManyOptions, ObjectLiteral } from 'typeorm';
import type { PaginationDto } from './dto/pagination.dto';
import type { PaginatedResult } from './interfaces/paginated-result.interface';

// Consulta una página y el total de registros con las opciones indicadas por el servicio.
export async function paginateRepository<T extends ObjectLiteral>(
  repository: Repository<T>,
  pagination: PaginationDto,
  options: FindManyOptions<T> = {},
): Promise<PaginatedResult<T>> {
  // Calcula cuántos resultados anteriores a la página solicitada se deben omitir.
  const skip = (pagination.page - 1) * pagination.limit;

  // findAndCount obtiene los registros de la página y el total sin paginar.
  const [data, total] = await repository.findAndCount({
    ...options,
    skip,
    take: pagination.limit,
  });

  // Devuelve una última página igual a cero cuando el conjunto está vacío.
  return {
    data,
    total,
    page: pagination.page,
    lastPage: Math.ceil(total / pagination.limit),
  };
}
