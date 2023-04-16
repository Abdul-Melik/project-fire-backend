import express, { RequestHandler } from 'express';
import * as UsersController from '../controllers/users';
import authenticateToken from '../middleware/authenticate-token';

const router = express.Router();

router.post('/register', UsersController.registerUser);
router.post('/login', UsersController.loginUser);
router.delete('/:userId', authenticateToken, UsersController.deleteUser);

export default router;
