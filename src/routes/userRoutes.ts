import express from 'express';

import verifyTokenMiddleware from '../middleware/verifyTokenMiddleware';
import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import * as usersController from '../controllers/usersController';

const router = express.Router();

router.get('/', verifyTokenMiddleware, usersController.getUsers);
router.get('/:userId', verifyTokenMiddleware, usersController.getUserById);
router.patch('/:userId', verifyTokenMiddleware, imageUploadMiddleware, usersController.updateUser);
router.delete('/:userId', verifyTokenMiddleware, usersController.deleteUser);

export default router;
