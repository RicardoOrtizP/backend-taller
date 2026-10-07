import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from "class-validator";
import { UserRole } from "../../constants/enum";

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre de usuario es obligatorio" })
  name!: string;

  @IsEmail({}, { message: "El correo electrónico no es válido" })
  email!: string;

  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password!: string;

  @IsOptional()
  @IsEnum(UserRole, { message: "El rol proporcionado no es válido" })
  role?: UserRole;
}
