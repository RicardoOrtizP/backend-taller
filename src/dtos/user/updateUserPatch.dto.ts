import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../constants/enum";

// dto para la edicion parcial del usuario
export class UpdateUserPatchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "El rol proporcionado no es válido" })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
