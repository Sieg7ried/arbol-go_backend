import { PartialType } from '@nestjs/mapped-types';
import { CreateLogroDto } from './create-logro.dto';

// PartialType hace que todas las propiedades de CreateLogroDto sean opcionales
export class UpdateLogroDto extends PartialType(CreateLogroDto) {}
