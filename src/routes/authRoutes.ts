import express from "express";

import imageUploadMiddleware from "../middleware/imageUploadMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import {
  registerUserSchema,
  loginUserSchema,
  sendResetPasswordEmailSchema,
} from "../schemas/authSchemas";
import * as authController from "../controllers/authController";

const router = express.Router();

router.get("/refresh", authController.refreshToken);
router.post(
  "/register",
  imageUploadMiddleware,
  validateResourceMiddleware(registerUserSchema),
  authController.registerUser
);
router.post(
  "/login",
  validateResourceMiddleware(loginUserSchema),
  authController.loginUser
);
router.post("/logout", authController.logoutUser);
router.post(
  "/reset-password",
  validateResourceMiddleware(sendResetPasswordEmailSchema),
  authController.sendResetPasswordEmail
);
router.post("/:userId/reset-password/:token", authController.resetPassword);

export default router;
