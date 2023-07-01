import { object } from 'zod';

import { emailSchema, passwordSchema, roleSchema, generateNameSchema } from './commonSchemas';

const firstNameSchema = generateNameSchema('First name', 3, 10);
const lastNameSchema = generateNameSchema('Last name', 3, 10);

export const updateUserSchema = object({
	body: object({
		email: emailSchema.optional(),
		firstName: firstNameSchema.optional(),
		lastName: lastNameSchema.optional(),
		password: passwordSchema.optional(),
		role: roleSchema.optional(),
	}),
});
