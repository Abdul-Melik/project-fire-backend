import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as ExpensesController from '../controllers/expenses';

const router = express.Router();

router.get('/', authenticateToken, ExpensesController.getExpenses);
router.get('/info', authenticateToken, ExpensesController.getExpensesInfo);
router.get('/:expenseId', authenticateToken, ExpensesController.getExpenseById);
router.post('/', authenticateToken, ExpensesController.createExpense);
router.patch('/:expenseId', authenticateToken, ExpensesController.updateExpense);
router.delete('/:expenseId', authenticateToken, ExpensesController.deleteExpense);

export default router;
