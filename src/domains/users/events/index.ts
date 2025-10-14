import { User } from '../entities/user.entity';

export interface IUserCreatedEvent {
  user: User;
  role_id?: string;
}
