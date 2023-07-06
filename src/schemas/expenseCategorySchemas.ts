import { z } from "zod";

import { nameSchema, descriptionSchema } from "./commonSchemas";

const expenseCategorySchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
});

export const createExpenseCategorySchema = z.object({
  body: expenseCategorySchema,
});

export const updateExpenseCategorySchema = z.object({
  body: expenseCategorySchema.partial(),
});
