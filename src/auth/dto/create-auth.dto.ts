import { IsString, IsBoolean, IsArray } from 'class-validator';

export class CreateAuthDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  fullName: string;

  @IsBoolean()
  isActive: boolean;

  @IsString({ each: true })
  @IsArray()
  roles: string[];
}
