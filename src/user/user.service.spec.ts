import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

describe('UserService.remove', () => {
  it('deactivates and soft-removes the account instead of deleting its relations', async () => {
    const user = Object.assign(new User(), { id: 12, isActive: true });
    const repository = {
      findOneBy: jest.fn().mockResolvedValue(user),
      softRemove: jest.fn().mockResolvedValue(user),
    };
    const service = new UserService(
      repository as unknown as Repository<User>,
    );

    await service.remove(user.id);

    expect(user.isActive).toBe(false);
    expect(repository.softRemove).toHaveBeenCalledWith(user);
  });
});
