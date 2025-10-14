import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { UserStatus, userStatus } from '../types';

export class CreateUserDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'johndoe@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => String(value).toLowerCase().trim())
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '08123456789',
  })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => String(value).trim())
  phone_number: string;

  @ApiProperty({
    description: 'The password of the user',
    example: 'securepassword123',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: 'The role of the user',
    example: true,
  })
  @IsBoolean()
  is_admin: boolean;

  @ApiProperty({
    description: 'The status of the user',
    enum: Object.values(userStatus),
    default: userStatus.Active,
  })
  @IsOptional()
  @IsIn(Object.values(userStatus))
  status?: UserStatus;

  @ApiProperty({
    description: 'The ID of the role assigned to the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  role_id?: string;
}

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}
