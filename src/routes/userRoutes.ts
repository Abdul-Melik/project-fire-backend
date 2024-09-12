import express from "express";

import verifyTokenMiddleware from "../middleware/verifyTokenMiddleware";
import imageUploadMiddleware from "../middleware/imageUploadMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import { updateUserSchema } from "../schemas/userSchemas";
import * as usersController from "../controllers/usersController";

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get("/", usersController.getUsers);
router.get("/:userId", usersController.getUserById);
router.patch(
  "/:userId",
  imageUploadMiddleware,
  validateResourceMiddleware(updateUserSchema),
  usersController.updateUser
);
router.delete("/:userId", usersController.deleteUser);

export default router;
