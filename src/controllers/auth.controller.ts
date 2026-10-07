import type { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  private authService = new AuthService();
  register = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.authService.registrar(req.body);
      res
        .status(201)
        .json({ message: "Usuario registrado exitosamente", data: user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(
        req.body,
      );

      // Inyectar Refresh token en Cookie HttpOnly
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      });

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        accessToken,
        user,
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (userId) {
      await this.authService.logout(userId);
    }
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshTokenCookie = req.cookies?.refreshToken;
      if (!refreshTokenCookie) {
        res.status(401).json({
          message: "Refresh token no proporcionado",
        });
        return;
      }

      const { accessToken, refreshToken } =
        await this.authService.refrescarToken(refreshTokenCookie);
    } catch (error) {}
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.forgotPassword(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };
}
