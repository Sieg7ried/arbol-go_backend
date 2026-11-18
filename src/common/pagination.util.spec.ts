import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { PaginationDto } from './dto/pagination.dto';
import { paginateRepository } from './pagination.util';

describe('PaginationDto', () => {
  it('uses defaults and transforms query strings to numbers', async () => {
    const pagination = plainToInstance(PaginationDto, {
      page: '3',
      limit: '20',
    });

    expect(await validate(pagination)).toHaveLength(0);
    expect(pagination.page).toBe(3);
    expect(pagination.limit).toBe(20);
    expect(plainToInstance(PaginationDto, {}).page).toBe(1);
    expect(plainToInstance(PaginationDto, {}).limit).toBe(10);
  });

  it('rejects limits above the configured maximum', async () => {
    const pagination = plainToInstance(PaginationDto, { limit: '51' });

    expect(await validate(pagination)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          property: 'limit',
          constraints: expect.objectContaining({ max: expect.any(String) }),
        }),
      ]),
    );
  });
});

describe('paginateRepository', () => {
  it('calculates skip/take and returns the standard page envelope', async () => {
    const rows = [{ id: 21 }];
    const repository = {
      findAndCount: jest.fn().mockResolvedValue([rows, 21]),
    };

    const result = await paginateRepository(
      repository as unknown as Repository<{ id: number }>,
      plainToInstance(PaginationDto, { page: '3', limit: '10' }),
    );

    expect(repository.findAndCount).toHaveBeenCalledWith({
      skip: 20,
      take: 10,
    });
    expect(result).toEqual({
      data: rows,
      total: 21,
      page: 3,
      lastPage: 3,
    });
  });
});
