import express from 'express';

import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import validateResource from '../middleware/validateResource';
import { registerUserSchema, loginUserSchema, sendResetPasswordEmailSchema } from '../schema/authSchemas';
import * as authController from '../controllers/authController';

const router = express.Router();

router.get('/refresh', authController.refreshToken);
router.post('/register', imageUploadMiddleware, validateResource(registerUserSchema), authController.registerUser);
router.post('/login', validateResource(loginUserSchema), authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/reset-password', validateResource(sendResetPasswordEmailSchema), authController.sendResetPasswordEmail);
router.post('/:userId/reset-password/:token', authController.resetPassword);

export default router;
