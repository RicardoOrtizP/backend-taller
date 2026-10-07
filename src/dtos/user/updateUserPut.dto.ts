import { IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";
import type { UserRole } from "../../constants/enum";

// Actualizacion de usuario completo
export class UpdateUserPutDto {
  @IsString()
  @IsNotEmpty({ message: "El nombre es obligatorio" })
  name!: string;

  @IsEmail({}, { message: "El correo electrónico no es valido" })
  email!: string;

  @IsEnum({}, { message: "El rol proporcionado no es válido" })
  role!: UserRole;
}
