import express from 'express';

import verifyTokenMiddleware from '../middleware/verifyTokenMiddleware';
import imageUploadMiddleware from '../middleware/imageUploadMiddleware';
import validateResource from '../middleware/validateResource';
import { updateUserSchema } from '../schema/userSchemas';
import * as usersController from '../controllers/usersController';

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get('/', usersController.getUsers);
router.get('/:userId', usersController.getUserById);
router.patch('/:userId', imageUploadMiddleware, validateResource(updateUserSchema), usersController.updateUser);
router.delete('/:userId', usersController.deleteUser);

export default router;
