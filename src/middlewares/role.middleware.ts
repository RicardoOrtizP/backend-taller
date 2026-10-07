import type { NextFunction, Request, Response } from "express";
import type { UserRole } from "../constants/enum";

export function roleMiddleware(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: "No autenticado." });
      return;
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        message: "No tiene permisos suficientes para realizar esta acción.",
      });
      return;
    }

    next();
  };
}
