import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as ExpensesController from '../controllers/expenses';

const router = express.Router();

router.post('/', authenticateToken, ExpensesController.createExpense);

export default router;
