import type { Repository } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { UserEntity } from "../entities/UserEntity";
import type { RegisterDto } from "../dtos/auth/register.dto";
import bcrypt from "bcryptjs";
import { UserRole } from "../constants/enum";
import type { LoginDto } from "../dtos/auth/login.dto";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { ForgotPasswordDto } from "../dtos/auth/forgotPassword.dto";
import type { ResetPasswordDto } from "../dtos/auth/resetPassword.dto";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "secret_1";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret_2";
export class AuthService {
  private userRepository: Repository<UserEntity> =
    AppDataSource.getRepository(UserEntity);

  // 1. Registro
  async registrar(dto: RegisterDto) {
    // verificar si el usuario con el email existe
    const userExists = await this.userRepository.findOneBy({
      email: dto.email,
    });

    if (userExists) {
      throw new Error("El correo electrónico ya está registrado.");
    }

    const password_hash = await bcrypt.hash(dto.password, 10);

    const newUser = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password_hash: password_hash,
      role: dto.role || UserRole.USUARIO, // default a usuario
    });

    await this.userRepository.save(newUser);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };
  }

  // 2 login
  async login(dto: LoginDto) {
    // const user = await this.userRepository.findOneBy({
    //   email: dto.email,
    //   is_active: true, // Verifica que el usuario este activo
    // });
    const user = await this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.password_hash")
      .where("user.email = :email", { email: dto.email })
      .getOne();

    if (!user) {
      throw new Error("Crendenciales inválidas.");
    }

    const validPassword = await bcrypt.compare(
      dto.password,
      user.password_hash,
    );
    if (!validPassword) {
      throw new Error("Credenciales inválidas.");
    }

    const accessToken = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: "7d",
    });

    user.refresh_token = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  // 3. Refrescar token
  async refrescarToken(refreshTokenActual: string) {
    try {
      const payload = jwt.verify(refreshTokenActual, JWT_REFRESH_SECRET) as {
        sub: string;
      };
      const user = await this.userRepository.findOneBy({
        id: payload.sub,
        is_active: true,
      });

      if (!user || !user.refresh_token) {
        throw new Error("Acceso no autorizado.");
      }

      const tokenMatch = await bcrypt.compare(
        refreshTokenActual,
        user.refresh_token,
      );
      if (!tokenMatch) {
        throw new Error("Refresh token no válido.");
      }

      const newAccessToken = jwt.sign(
        { sub: user.id, email: user.email, role: user.role },
        JWT_ACCESS_SECRET,
        { expiresIn: "15m" },
      );
      const newRefreshToken = jwt.sign({ sub: user.id }, JWT_REFRESH_SECRET, {
        expiresIn: "7d",
      });
      user.refresh_token = await bcrypt.hash(newRefreshToken, 10);
      await this.userRepository.save(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new Error("Refresh token inválido o expirado.");
    }
  }

  // 4. Cerrar Sesion
  async logout(userId: string) {
    await this.userRepository.update(userId, { refresh_token: null });
  }

  // 5. Solicitar recuperación de password
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOneBy({
      email: forgotPasswordDto.email,
      is_active: true,
    });

    if (!user) {
      return {
        message:
          "Si el correo existe, se enviarán las instrucciónes para reestablecer la contraseña",
      };
    }

    // Token aleatorio
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Validez de 1 hora
    user.reset_password_token = resetTokenHash;
    user.reset_password_expires = new Date(Date.now() + 3600000);
    await this.userRepository.save(user);

    // Nota: Aquí integraríamos el servicio de correo (Nodemailer, Sendgrid, etc.)
    console.log(
      `[EMAIL DEV] Enlace de recuperación: http://localhost:3000/reset-password?token=${resetToken}`,
    );

    return {
      message:
        "Si el correo existe, se enviarán las instrucciones para restablecer la contraseña.",
    };
  }

  // 6. Resetear password
  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto
      .createHash("sha256")
      .update(dto.token)
      .digest("hex");

    const user = await this.userRepository.findOne({
      where: {
        reset_password_token: tokenHash,
      },
    });

    if (
      !user ||
      !user.reset_password_expires ||
      user.reset_password_expires < new Date()
    ) {
      throw new Error("El token de recuperación es inválido o ha expirado.");
    }

    user.password_hash = await bcrypt.hash(dto.new_password, 10);
    user.reset_password_token = null;
    user.reset_password_expires = null;
    user.refresh_token = null; // Revocar sesiones activas por seguridad.

    await this.userRepository.save(user);
    return { message: "Contraseña actualizada exitosamente." };
  }
}
