import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

// Define parámetros opcionales y acotados para las consultas paginadas.
export class PaginationDto {
  // Convierte el parámetro page de texto a número antes de validarlo.
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  page = 1;

  // Convierte limit, exige un valor positivo y evita consultas excesivamente grandes.
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  limit = 10;
}
