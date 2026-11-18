// Define la estructura uniforme que retornan los listados paginados.
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}
