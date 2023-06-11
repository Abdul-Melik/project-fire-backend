import express from 'express';

import verifyTokenMiddleware from '../middleware/verifyTokenMiddleware';
import * as expensesController from '../controllers/expensesController';

const router = express.Router();

router.get('/', verifyTokenMiddleware, expensesController.getExpenses);
router.get('/info', verifyTokenMiddleware, expensesController.getExpensesInfo);
router.get('/:expenseId', verifyTokenMiddleware, expensesController.getExpenseById);
router.post('/', verifyTokenMiddleware, expensesController.createExpense);
router.patch('/:expenseId', verifyTokenMiddleware, expensesController.updateExpense);
router.delete('/:expenseId', verifyTokenMiddleware, expensesController.deleteExpense);

export default router;
