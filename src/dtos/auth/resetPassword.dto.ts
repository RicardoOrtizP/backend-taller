import { IsEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @IsString()
  token!: string;

  @IsString()
  @MinLength(6, {
    message: "La contraseña debe contar con al menos 6 carácteres",
  })
  new_password!: string;
}
