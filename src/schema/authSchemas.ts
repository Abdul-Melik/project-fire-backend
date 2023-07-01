import { object, boolean } from 'zod';

import { emailSchema, passwordSchema, roleSchema, generateNameSchema } from './commonSchemas';

const firstNameSchema = generateNameSchema('First name', 3, 10);
const lastNameSchema = generateNameSchema('Last name', 3, 10);

export const registerUserSchema = object({
	body: object({
		email: emailSchema,
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		password: passwordSchema,
		role: roleSchema.optional(),
	}),
});

export const loginUserSchema = object({
	body: object({
		email: emailSchema,
		password: passwordSchema,
		rememberMe: boolean({
			invalid_type_error: 'Remember me must be a boolean.',
		}).optional(),
	}),
});

export const sendResetPasswordEmailSchema = object({
	body: object({
		email: emailSchema,
	}),
});
