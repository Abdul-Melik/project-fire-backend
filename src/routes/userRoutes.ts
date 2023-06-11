import express from 'express';

import authenticateTokenMiddleware from '../middleware/authenticateTokenMiddleware';
import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import * as usersController from '../controllers/usersController';

const router = express.Router();

router.get('/', authenticateTokenMiddleware, usersController.getUsers);
router.get('/:userId', authenticateTokenMiddleware, usersController.getUserById);
router.patch('/:userId', authenticateTokenMiddleware, imageUploadMiddleware, usersController.updateUser);
router.delete('/:userId', authenticateTokenMiddleware, usersController.deleteUser);

export default router;
