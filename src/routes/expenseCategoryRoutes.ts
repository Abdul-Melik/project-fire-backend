import express from 'express';

import authenticateTokenMiddleware from '../middleware/authenticateTokenMiddleware';
import * as expenseCategoriesController from '../controllers/expenseCategoriesController';

const router = express.Router();

router.get('/', authenticateTokenMiddleware, expenseCategoriesController.getExpenseCategories);
router.get('/:expenseCategoryId', authenticateTokenMiddleware, expenseCategoriesController.getExpenseCategoryById);
router.post('/', authenticateTokenMiddleware, expenseCategoriesController.createExpenseCategory);
router.patch('/:expenseCategoryId', authenticateTokenMiddleware, expenseCategoriesController.updateExpenseCategory);
router.delete('/:expenseCategoryId', authenticateTokenMiddleware, expenseCategoriesController.deleteExpenseCategory);

export default router;
