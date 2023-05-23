import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as ExpenseCategoriesController from '../controllers/expense-categories';

const router = express.Router();

router.get('/', authenticateToken, ExpenseCategoriesController.getExpenseCategories);
router.get('/:expenseCategoryId', authenticateToken, ExpenseCategoriesController.getExpenseCategoryById);
router.post('/', authenticateToken, ExpenseCategoriesController.createExpenseCategory);
router.delete('/:expenseCategoryId', authenticateToken, ExpenseCategoriesController.deleteExpenseCategory);

export default router;
