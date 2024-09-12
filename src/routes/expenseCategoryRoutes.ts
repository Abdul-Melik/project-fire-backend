import express from "express";

import verifyTokenMiddleware from "../middleware/verifyTokenMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import {
  createExpenseCategorySchema,
  updateExpenseCategorySchema,
} from "../schemas/expenseCategorySchemas";
import * as expenseCategoriesController from "../controllers/expenseCategoriesController";

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get("/", expenseCategoriesController.getExpenseCategories);
router.get(
  "/:expenseCategoryId",
  expenseCategoriesController.getExpenseCategoryById
);
router.post(
  "/",
  validateResourceMiddleware(createExpenseCategorySchema),
  expenseCategoriesController.createExpenseCategory
);
router.patch(
  "/:expenseCategoryId",
  validateResourceMiddleware(updateExpenseCategorySchema),
  expenseCategoriesController.updateExpenseCategory
);
router.delete(
  "/:expenseCategoryId",
  expenseCategoriesController.deleteExpenseCategory
);

export default router;
