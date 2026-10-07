import type { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import type { FilterUserDto } from "../dtos/user/filterUser.dto";

export class UserController {
  private userService = new UserService();

  getAll = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const query = res.locals.query as unknown as FilterUserDto;
      const result = await this.userService.getAll(query);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getById(id as string);
      res.status(200).json({ data: user });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  };

  updatePut = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.updatePut(
        id as string,
        req.body,
      );
      res.status(200).json({
        message: "Usuario actualizado exitosamente.",
        data: updatedUser,
      });
    } catch (error: any) {}
  };

  updatePatch = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.updatedPatch(
        id as string,
        req.body,
      );
      res.status(200).json({
        message: "Usuario actualizado exitosamente",
        data: updatedUser,
      });
    } catch (error: any) {}
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.userService.softDelete(id as string);
      res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  };
}
