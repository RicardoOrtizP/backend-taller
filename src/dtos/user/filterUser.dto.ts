import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from "class-validator";
import { UserRole } from "../../constants/enum";

export class FilterUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === "true" || value === true) return true;
    if (value === "false" || value === false) return false;
    return value;
  })
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  // Paginacion
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;

  // Criterios de ordenamiento
  @IsOptional()
  @IsString()
  sortBy: string = "created_at"; // Campos permitidos 'name','email','created_at'

  @IsOptional()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  @Transform(({ value }) => value?.toUpperCase())
  sortOrder: "ASC" | "DESC" | "asc" | "desc" = "DESC";
}
