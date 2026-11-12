import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateLogroDto } from './create-logro.dto';

/**
 * Permite actualizar los datos visibles/recompensa sin cambiar el código lógico único.
 */
export class UpdateLogroDto extends PartialType(
  OmitType(CreateLogroDto, ['codigo'] as const),
) {}
