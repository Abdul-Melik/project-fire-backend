import express from 'express';

import authenticateToken from '../middleware/authenticate-token';
import * as expenseCategoriesController from '../controllers/expense-categories';

const router = express.Router();

router.get('/', authenticateToken, expenseCategoriesController.getExpenseCategories);
router.get('/:expenseCategoryId', authenticateToken, expenseCategoriesController.getExpenseCategoryById);
router.post('/', authenticateToken, expenseCategoriesController.createExpenseCategory);
router.patch('/:expenseCategoryId', authenticateToken, expenseCategoriesController.updateExpenseCategory);
router.delete('/:expenseCategoryId', authenticateToken, expenseCategoriesController.deleteExpenseCategory);

export default router;
