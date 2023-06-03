import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import imageUpload from '../middleware/image-upload';
import * as usersController from '../controllers/users';

const router = express.Router();

router.get('/', authenticateToken, usersController.getUsers);
router.get('/:userId', authenticateToken, usersController.getUserById);
router.post('/register', imageUpload, usersController.registerUser);
router.post('/login', usersController.loginUser);
router.post('/reset-password', usersController.sendResetPasswordEmail);
router.post('/:userId/reset-password/:token', usersController.resetPassword);
router.patch('/:userId', authenticateToken, imageUpload, usersController.updateUser);
router.delete('/:userId', authenticateToken, usersController.deleteUser);

export default router;
