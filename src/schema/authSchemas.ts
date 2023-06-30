import { object, boolean } from 'zod';

import { emailSchema, firstNameSchema, lastNameSchema, passwordSchema, roleSchema } from './commonSchemas';

export const registerUserSchema = object({
	body: object({
		email: emailSchema,
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		password: passwordSchema,
		role: roleSchema,
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
