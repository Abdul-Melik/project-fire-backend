import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as expensesController from '../controllers/expenses';

const router = express.Router();

router.get('/', authenticateToken, expensesController.getExpenses);
router.get('/info', authenticateToken, expensesController.getExpensesInfo);
router.get('/:expenseId', authenticateToken, expensesController.getExpenseById);
router.post('/', authenticateToken, expensesController.createExpense);
router.patch('/:expenseId', authenticateToken, expensesController.updateExpense);
router.delete('/:expenseId', authenticateToken, expensesController.deleteExpense);

export default router;
