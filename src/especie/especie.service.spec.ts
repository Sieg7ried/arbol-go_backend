import { ConflictException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Especie } from './entities/especie.entity';
import { EspecieService } from './especie.service';

describe('EspecieService.remove', () => {
  let service: EspecieService;
  let repository: {
    findOneBy: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };
    service = new EspecieService(
      repository as unknown as Repository<Especie>,
    );
  });

  it('returns a conflict when trees still reference the species', async () => {
    const especie = Object.assign(new Especie(), { id: 7 });
    const foreignKeyError = Object.assign(new Error('foreign key'), {
      code: 'ER_ROW_IS_REFERENCED_2',
    });
    repository.findOneBy.mockResolvedValue(especie);
    repository.remove.mockRejectedValue(
      new QueryFailedError('DELETE', [], foreignKeyError),
    );

    await expect(service.remove(7)).rejects.toBeInstanceOf(ConflictException);
  });

  it('propagates database errors unrelated to a foreign key', async () => {
    const especie = Object.assign(new Especie(), { id: 7 });
    const databaseError = new Error('connection lost');
    repository.findOneBy.mockResolvedValue(especie);
    repository.remove.mockRejectedValue(databaseError);

    await expect(service.remove(7)).rejects.toBe(databaseError);
  });
});
