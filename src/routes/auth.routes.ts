import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { RegisterDto } from "../dtos/auth/register.dto";
import { LoginDto } from "../dtos/auth/login.dto";
import { authMiddleware } from "../middlewares/auth.midleware";
import { validateDto } from "../middlewares/validate-dto.middleware";
import { ForgotPasswordDto } from "../dtos/auth/forgotPassword.dto";
import { ResetPasswordDto } from "../dtos/auth/resetPassword.dto";

const router = Router();
const authController = new AuthController();

// rutas publicas
router.post("/register", validateDto(RegisterDto), authController.register);
router.post("/login", validateDto(LoginDto), authController.login);
router.post(
  "/forgot-password",
  validateDto(ForgotPasswordDto),
  authController.forgotPassword,
);
router.post(
  "/reset-password",
  validateDto(ResetPasswordDto),
  authController.resetPassword,
);

// rutas protegidas
router.post("/logout", authMiddleware, authController.logout);

export default router;
