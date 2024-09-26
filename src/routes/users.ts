import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import imageUpload from '../middleware/image-upload';
import * as UsersController from '../controllers/users';

const router = express.Router();

router.get('/', authenticateToken, UsersController.getUsers);
router.get('/:userId', authenticateToken, UsersController.getUserById);
router.post('/register', imageUpload, UsersController.registerUser);
router.post('/login', UsersController.loginUser);
router.post('/reset-password', UsersController.sendResetPasswordEmail);
router.post('/:userId/reset-password/:token', UsersController.resetPassword);
router.delete('/:userId', authenticateToken, UsersController.deleteUser);

export default router;
