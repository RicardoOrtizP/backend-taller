import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../constants/enum";
import jwt from "jsonwebtoken";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "secret_1";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "secret_2";

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Token de acceso no proporcionado." });
    return;
  }

  const token = authHeader.split(" ")[1];
  console.log(token);

  try {
    const payload = jwt.verify(token!, JWT_ACCESS_SECRET) as JwtPayload;

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error: any) {
    console.log(error.message);
    res.status(401).json({ message: "Access token inválido o expirado." });
  }
}
