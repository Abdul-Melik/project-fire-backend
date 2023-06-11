import express from 'express';

import verifyTokenMiddleware from '../middleware/verifyTokenMiddleware';
import * as expenseCategoriesController from '../controllers/expenseCategoriesController';

const router = express.Router();

router.get('/', verifyTokenMiddleware, expenseCategoriesController.getExpenseCategories);
router.get('/:expenseCategoryId', verifyTokenMiddleware, expenseCategoriesController.getExpenseCategoryById);
router.post('/', verifyTokenMiddleware, expenseCategoriesController.createExpenseCategory);
router.patch('/:expenseCategoryId', verifyTokenMiddleware, expenseCategoriesController.updateExpenseCategory);
router.delete('/:expenseCategoryId', verifyTokenMiddleware, expenseCategoriesController.deleteExpenseCategory);

export default router;
