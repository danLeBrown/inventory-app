import type { BaseEntity } from '../common/base.entity';
import type { BaseDto } from '../common/dto/base.dto';
import type { Constructor } from '../types';

export function SetDto(
  dtoClass: Constructor<BaseDto, [BaseEntity<BaseDto>]>,
): ClassDecorator {
  return (ctor) => {
    ctor.prototype.dtoClass = dtoClass;
  };
}
