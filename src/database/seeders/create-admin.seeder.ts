import { Seeder } from '@concepta/typeorm-seeding';

import { User } from '../../domains/users/entities/user.entity';

export class CreateAdminSeeder extends Seeder {
  async run(): Promise<void> {
    const userRepo = this.seedingSource.dataSource.getRepository(User);
    await userRepo.save(
      userRepo.create([
        {
          first_name: 'Ayomide',
          last_name: 'Ojo',
          email: 'ayomidedaniel00@gmail.com',
          phone_number: '08000000001',
          password: 'J6U85UPfRb28Kl7X',
          is_admin: true,
        },
      ]),
    );
  }
}
