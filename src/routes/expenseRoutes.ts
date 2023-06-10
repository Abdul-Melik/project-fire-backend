import express from 'express';

import authenticateTokenMiddleware from '../middleware/authenticateTokenMiddleware';
import * as expensesController from '../controllers/expensesController';

const router = express.Router();

router.get('/', authenticateTokenMiddleware, expensesController.getExpenses);
router.get('/info', authenticateTokenMiddleware, expensesController.getExpensesInfo);
router.get('/:expenseId', authenticateTokenMiddleware, expensesController.getExpenseById);
router.post('/', authenticateTokenMiddleware, expensesController.createExpense);
router.patch('/:expenseId', authenticateTokenMiddleware, expensesController.updateExpense);
router.delete('/:expenseId', authenticateTokenMiddleware, expensesController.deleteExpense);

export default router;
