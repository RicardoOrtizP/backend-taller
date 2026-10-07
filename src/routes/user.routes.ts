import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateQuery } from "../middlewares/validate-query.middleware";
import { FilterUserDto } from "../dtos/user/filterUser.dto";
import { validateDto } from "../middlewares/validate-dto.middleware";
import { UpdateUserPutDto } from "../dtos/user/updateUserPut.dto";
import { UpdateUserPatchDto } from "../dtos/user/updateUserPatch.dto";
import { roleMiddleware } from "../middlewares/role.middleware";
import { UserRole } from "../constants/enum";
import { authMiddleware } from "../middlewares/auth.midleware";

const router = Router();
const userController = new UserController();

router.use(authMiddleware);

router.get("/", validateQuery(FilterUserDto), userController.getAll);
router.get("/:id", userController.getById);
router.put("/:id", validateDto(UpdateUserPutDto), userController.updatePut);
router.patch(
  "/:id",
  validateDto(UpdateUserPatchDto),
  userController.updatePatch,
);
router.delete("/:id", roleMiddleware([UserRole.ADMIN]), userController.delete);

export default router;
