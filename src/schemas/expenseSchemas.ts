import { z } from "zod";

import {
  generateIntegerNumberRangeSchemas,
  generateNonEmptyStringSchema,
  generatePositiveNumberSchemas,
} from "./schemaGenerators";
import { MonthEnum } from "./schemaEnums";
import { startDateSchema, endDateSchema } from "./commonSchemas";

const yearShema = generateIntegerNumberRangeSchemas("Year", 2000, 2050);

const monthSchema = MonthEnum;

const plannedExpenseSchema = generatePositiveNumberSchemas("Planned expense");

const actualExpenseSchema = generatePositiveNumberSchemas("Actual expense");

const expenseCategorySchema = generateNonEmptyStringSchema("Expense category");

const expenseSchema = z.object({
  year: yearShema,
  month: monthSchema,
  plannedExpense: plannedExpenseSchema,
  actualExpense: actualExpenseSchema,
  expenseCategory: expenseCategorySchema,
});

export const getExpensesInfoSchema = z.object({
  query: z
    .object({
      startDate: startDateSchema,
      endDate: endDateSchema,
    })
    .partial(),
});

export const createExpenseSchema = z.object({
  body: expenseSchema.partial({
    plannedExpense: true,
    actualExpense: true,
  }),
});

export const updateExpenseSchema = z.object({
  body: expenseSchema.partial(),
});
