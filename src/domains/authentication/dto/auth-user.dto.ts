import { UserDto } from '@/domains/users/dto/user.dto';
import { User } from '@/domains/users/entities/user.entity';

export class AuthUserDto {
  user: UserDto;

  public static create(user: User) {
    return new this(user);
  }

  constructor(user: User) {
    this.user = new UserDto(user);
  }
}
