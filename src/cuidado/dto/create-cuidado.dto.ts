// Importa los validadores necesarios para comprobar los datos recibidos.
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoCuidadoEnum } from '../../common/enums/estado-cuidado.enum';
import { TipoCuidadoEnum } from '../../common/enums/tipo-cuidado.enum';

// Define los datos necesarios para registrar un cuidado.
export class CreateCuidadoDto {
  // Valida el identificador del árbol relacionado.
  @IsNumber({}, { message: 'id_arbol debe ser un número' })
  @IsNotEmpty({ message: 'id_arbol es obligatorio' })
  @ApiProperty({ example: 1, description: 'ID del árbol relacionado.' })
  id_arbol: number;

  // Valida el tipo de actividad de cuidado.
  // IsEnum impide persistir categorías desconocidas para la lógica de cuidados.
  @IsEnum(TipoCuidadoEnum, {
    message: 'tipo_cuidado debe ser una categoría permitida',
  })
  @ApiProperty({
    enum: TipoCuidadoEnum,
    example: TipoCuidadoEnum.RIEGO,
  })
  tipo_cuidado: TipoCuidadoEnum;

  // Valida que la fecha programada tenga un formato válido.
  @IsDateString(
    {},
    { message: 'fecha_programada debe tener un formato ISO válido' },
  )
  // Exige hora y zona explícita para poder persistir un instante UTC sin ambigüedad.
  @Matches(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/,
    {
      message:
        'fecha_programada debe incluir hora y zona horaria (UTC o desplazamiento)',
    },
  )
  @IsNotEmpty({ message: 'fecha_programada es obligatoria' })
  @ApiProperty({ example: '2026-11-05T14:00:00.000Z', format: 'date-time' })
  fecha_programada: string;

  // Permite registrar opcionalmente la fecha en que se realizó el cuidado.
  @IsDateString(
    {},
    { message: 'fecha_realizada debe tener un formato ISO válido' },
  )
  // Valida también la zona horaria de la fecha real para evitar horas locales ambiguas.
  @Matches(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/,
    {
      message:
        'fecha_realizada debe incluir hora y zona horaria (UTC o desplazamiento)',
    },
  )
  @IsOptional()
  @ApiPropertyOptional({
    example: '2026-11-05T14:30:00.000Z',
    format: 'date-time',
  })
  fecha_realizada?: string;

  // Permite registrar observaciones adicionales sobre el cuidado.
  @IsString({ message: 'observaciones debe ser una cadena de texto' })
  @IsOptional()
  @ApiPropertyOptional({ example: 'Se aplicó riego profundo.' })
  observaciones?: string;

  // Valida el estado actual del cuidado.
  // IsEnum garantiza que cron y gamificación reciban solo estados soportados.
  @IsEnum(EstadoCuidadoEnum, {
    message: 'estado debe ser un estado de cuidado permitido',
  })
  @ApiProperty({
    enum: EstadoCuidadoEnum,
    example: EstadoCuidadoEnum.PENDIENTE,
  })
  estado: EstadoCuidadoEnum;
}
