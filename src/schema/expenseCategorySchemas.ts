import { object } from 'zod';

import { descriptionSchema, generateNameSchema } from './commonSchemas';

const nameSchema = generateNameSchema('Name', 3, 15);

export const createExpenseCategorySchema = object({
	body: object({
		name: nameSchema,
		description: descriptionSchema,
	}),
});

export const updateExpenseCategorySchema = object({
	body: object({
		name: nameSchema.optional(),
		description: descriptionSchema.optional(),
	}),
});
