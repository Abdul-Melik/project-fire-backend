import express from 'express';

import authenticateTokenMiddleware from '../middleware/authenticateTokenMiddleware';
import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import * as usersController from '../controllers/usersController';

const router = express.Router();

router.get('/', authenticateTokenMiddleware, usersController.getUsers);
router.get('/:userId', authenticateTokenMiddleware, usersController.getUserById);
router.post('/register', imageUploadMiddleware, usersController.registerUser);
router.post('/login', usersController.loginUser);
router.post('/logout', usersController.logoutUser);
router.post('/reset-password', usersController.sendResetPasswordEmail);
router.post('/:userId/reset-password/:token', usersController.resetPassword);
router.patch('/:userId', authenticateTokenMiddleware, imageUploadMiddleware, usersController.updateUser);
router.delete('/:userId', authenticateTokenMiddleware, usersController.deleteUser);

export default router;
