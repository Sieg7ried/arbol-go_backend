import { validateSync } from 'class-validator';
import { CreateArbolDto } from '../../arbol/dto/create-arbol.dto';
import { UpdateArbolDto } from '../../arbol/dto/update-arbol.dto';
import { CreateCuidadoDto } from '../../cuidado/dto/create-cuidado.dto';
import { UpdateCuidadoDto } from '../../cuidado/dto/update-cuidado.dto';
import { CreateRecordatorioDto } from '../../recordatorio/dto/create-recordatorio.dto';
import { UpdateRecordatorioDto } from '../../recordatorio/dto/update-recordatorio.dto';

describe('domain enum DTO validation', () => {
  it('rejects free-text states and categories on create and update DTOs', () => {
    const invalidDtos = [
      {
        dto: Object.assign(new CreateArbolDto(), { estado_salud: 'enfermo' }),
        property: 'estado_salud',
      },
      {
        dto: Object.assign(new UpdateArbolDto(), { estado_salud: 'enfermo' }),
        property: 'estado_salud',
      },
      {
        dto: Object.assign(new CreateCuidadoDto(), {
          tipo_cuidado: 'limpieza',
        }),
        property: 'tipo_cuidado',
      },
      {
        dto: Object.assign(new UpdateCuidadoDto(), { estado: 'en_progreso' }),
        property: 'estado',
      },
      {
        dto: Object.assign(new CreateRecordatorioDto(), {
          repeticion: 'cada_dos_dias',
        }),
        property: 'repeticion',
      },
      {
        dto: Object.assign(new UpdateRecordatorioDto(), { estado: 'enviado' }),
        property: 'estado',
      },
    ];

    for (const { dto, property } of invalidDtos) {
      const propertyError = validateSync(dto).find(
        (error) => error.property === property,
      );
      expect(propertyError?.constraints).toHaveProperty('isEnum');
    }
  });

  it('accepts canonical lowercase enum values', () => {
    const validDtos = [
      Object.assign(new CreateArbolDto(), { estado_salud: 'saludable' }),
      Object.assign(new CreateCuidadoDto(), {
        tipo_cuidado: 'riego',
        estado: 'pendiente',
      }),
      Object.assign(new CreateRecordatorioDto(), {
        repeticion: 'mensual',
        estado: 'pendiente',
      }),
    ];

    for (const dto of validDtos) {
      const propertyErrors = validateSync(dto).filter((error) =>
        ['estado_salud', 'tipo_cuidado', 'estado', 'repeticion'].includes(
          error.property,
        ),
      );
      expect(propertyErrors).toHaveLength(0);
    }
  });
});
