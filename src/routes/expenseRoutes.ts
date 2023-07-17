import express from "express";

import verifyTokenMiddleware from "../middleware/verifyTokenMiddleware";
import validateResourceMiddleware from "../middleware/validateResourceMiddleware";
import {
  getExpensesInfoSchema,
  createExpenseSchema,
  updateExpenseSchema,
} from "../schemas/expenseSchemas";
import * as expensesController from "../controllers/expensesController";

const router = express.Router();

router.use(verifyTokenMiddleware);

router.get("/", expensesController.getExpenses);
router.get(
  "/info",
  validateResourceMiddleware(getExpensesInfoSchema),
  expensesController.getExpensesInfo
);
router.get("/:expenseId", expensesController.getExpenseById);
router.post(
  "/",
  validateResourceMiddleware(createExpenseSchema),
  expensesController.createExpense
);
router.patch(
  "/:expenseId",
  validateResourceMiddleware(updateExpenseSchema),
  expensesController.updateExpense
);
router.delete("/:expenseId", expensesController.deleteExpense);

export default router;
