import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import type { NextFunction, Request, Response } from "express";

export function validateDto(dtoClass: any) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const dtoInstance = plainToInstance(dtoClass, req.body);
    const errors: ValidationError[] = await validate(dtoInstance);

    if (errors.length > 0) {
      const formattedErrors = errors.map((err) => ({
        property: err.property,
        constraints: err.constraints,
      }));
      res
        .status(400)
        .json({ message: "Error de validación", errors: formattedErrors });
      return;
    }

    req.body = dtoInstance;
    next();
  };
}
