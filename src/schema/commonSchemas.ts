import { string, nativeEnum } from 'zod';

import { Role } from '@prisma/client';

export const emailSchema = string({
	required_error: 'Email is required.',
	invalid_type_error: 'Email must be a string.',
}).email('Email is not valid.');

export const passwordSchema = string({
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

export const roleSchema = nativeEnum(Role, {
	errorMap: () => ({ message: 'Role is not valid.' }),
});

export const descriptionSchema = string({
	required_error: 'Description is required.',
	invalid_type_error: 'Description must be a string.',
}).nonempty('Description can not be empty.');

export const generateNameSchema = (key: string, min: number, max: number) =>
	string({
		required_error: `${key} is required.`,
		invalid_type_error: `${key} must be a string.`,
	})
		.min(min, `${key} must be at least ${min} characters long.`)
		.max(max, `${key} can't be more than ${max} characters long.`);
