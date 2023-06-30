import { object } from 'zod';

import { emailSchema, firstNameSchema, lastNameSchema, passwordSchema, roleSchema } from './commonSchemas';

export const updateUserSchema = object({
	body: object({
		email: emailSchema.optional(),
		firstName: firstNameSchema.optional(),
		lastName: lastNameSchema.optional(),
		password: passwordSchema.optional(),
		role: roleSchema,
	}),
});
