import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { NextFunction, Request, Response } from "express";

export function validateQuery(dtoClass: any) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.query, {
      enableImplicitConversion: true,
    });
    const errors = await validate(dtoInstance as object);
    if (errors.length > 0) {
      const formattedErrors = errors.map((error) => ({
        property: error.property,
        constraints: error.constraints,
      }));
      res.status(400).json({
        message: "Parámetros de consulta no válidos",
        errors: formattedErrors,
      });
      return;
    }

    res.locals.query = dtoInstance;
    next();
  };
}
