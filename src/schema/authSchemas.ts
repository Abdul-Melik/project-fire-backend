import { object, string, boolean, nativeEnum } from 'zod';

import { Role } from '@prisma/client';

const emailSchema = string({
	required_error: 'Email is required.',
	invalid_type_error: 'Email must be a string.',
}).email('Email is not valid.');

const passwordSchema = string({
	required_error: 'Password is required.',
	invalid_type_error: 'Password must be a string.',
})
	.min(6, 'Password must be at least 6 characters long.')
	.refine(value => /[A-Z]/.test(value), {
		message: 'Password must contain at least one uppercase letter.',
	})
	.refine(value => /\d/.test(value), {
		message: 'Password must contain at least one number.',
	})
	.refine(value => /[^A-Za-z0-9]/.test(value), {
		message: 'Password must contain at least one non-alphanumeric character.',
	});

export const registerUserSchema = object({
	body: object({
		email: emailSchema,
		firstName: string({
			required_error: 'First name is required.',
			invalid_type_error: 'First name must be a string.',
		})
			.min(3, 'First name must be at least 3 characters long.')
			.max(10, "First name can't be more than 10 characters long."),
		lastName: string({
			required_error: 'Last name is required.',
			invalid_type_error: 'Last name must be a string.',
		})
			.min(3, 'Last name must be at least 3 characters long.')
			.max(10, "Last name can't be more than 10 characters long."),
		password: passwordSchema,
		role: nativeEnum(Role, {
			errorMap: () => ({ message: 'Role is not valid.' }),
		}).optional(),
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
