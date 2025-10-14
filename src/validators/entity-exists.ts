import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import type {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraintInterface,
} from 'class-validator';
import { registerDecorator, ValidatorConstraint } from 'class-validator';
import type { EntitySchema, FindOptionsWhere, ObjectType } from 'typeorm';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ name: 'entityExists', async: true })
@Injectable()
export class EntityExistsValidator implements ValidatorConstraintInterface {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  public async validate<E>(
    value: string,
    args: IExistsValidationArguments<E>,
  ): Promise<boolean> {
    const [entityClass, findCondition] = args.constraints;

    let entityTarget:
      | string
      | ObjectType<E>
      | EntitySchema<E>
      | ((validationArguments: ValidationArguments) => string);

    // check if the currently validated property is an array
    if (
      args.object[args.property] &&
      typeof args.object[args.property] !== 'string' &&
      args.object[args.property].length > 0
    ) {
      // reassign the property of the object that will be validated on each iteration when {each: true} is set
      const newArgs: IExistsValidationArguments<E> = {
        ...args,
        object: {
          ...args.object,
          [args.property]: value,
        },
      };

      entityTarget = this.isValidationFunction(entityClass)
        ? entityClass(newArgs)
        : entityClass;

      if (!this.dataSource.hasMetadata(entityTarget)) {
        return false;
      }

      return (
        (await this.dataSource.getRepository(entityTarget).count({
          where: findCondition(newArgs),
        })) > 0
      );
    }

    entityTarget = this.isValidationFunction(entityClass)
      ? entityClass(args)
      : entityClass;

    if (!this.dataSource.hasMetadata(entityTarget)) {
      return false;
    }

    // currently validated property is a string
    return (
      (await this.dataSource.getRepository(entityTarget).count({
        where: findCondition(args),
      })) > 0
    );
  }

  defaultMessage(args: ValidationArguments): string {
    const [entityClass] = args.constraints;
    const entity =
      entityClass.name ||
      (this.isValidationFunction(args.constraints[0])
        ? args.constraints[0](args)
        : 'Entity');

    return `The selected ${args.property} does not exist in "${entity}" entity`;
  }

  private isValidationFunction(
    entityTarget: unknown,
  ): entityTarget is (validationArguments: ValidationArguments) => string {
    return typeof entityTarget === 'function' && entityTarget.length === 1;
  }
}

type ExistsValidationConstraints<E> = [
  (
    | ObjectType<E>
    | EntitySchema<E>
    | string
    | ((validationArguments: ValidationArguments) => string)
  ),
  (
    validationArguments: ValidationArguments,
  ) => FindOptionsWhere<E> | Array<FindOptionsWhere<E>>,
];
interface IExistsValidationArguments<E> extends ValidationArguments {
  constraints: ExistsValidationConstraints<E>;
}

export function EntityExists<E>(
  constraints: Partial<ExistsValidationConstraints<E>>,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints,
      validator: EntityExistsValidator,
    });
  };
}
