import { z } from 'zod';

import { Role } from '@prisma/client';

// Helper functions to generate schemas with common properties
const generateNameSchema = (key: string, min: number, max: number) =>
	z
		.string({
			required_error: `${key} is required.`,
			invalid_type_error: `${key} must be a string.`,
		})
		.min(min, `${key} must be at least ${min} characters long.`)
		.max(max, `${key} can't be more than ${max} characters long.`);

const generatePaginationSchema = (key: string) =>
	z
		.string({
			invalid_type_error: `${key} must be a string.`,
		})
		.superRefine((value, ctx) => {
			const parsedValue = parseInt(value);
			if (isNaN(parsedValue)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${key} can't be parsed to an integer.`,
				});
				return z.NEVER;
			}
			if (parsedValue < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${key} must be greater than 0.`,
				});
				return z.NEVER;
			}
			return parsedValue;
		});

// Zod enums
const OrderByFieldEnum = z.enum(['client', 'industry', 'totalHoursBilled', 'amountBilledBAM', 'invoiceStatus']);

const OrderDirectionEnum = z.enum(['asc', 'desc']);

// Schemas for sorting and pagination
export const orderByFieldSchema = z.union([z.literal(''), OrderByFieldEnum], {
	errorMap: () => ({ message: 'Order by field is not valid.' }),
});

export const orderDirectionSchema = z.union([z.literal(''), OrderDirectionEnum], {
	errorMap: () => ({ message: 'Order direction is not valid.' }),
});

export const takeSchema = generatePaginationSchema('Take');

export const pageSchema = generatePaginationSchema('Page');

// Schemas for authentication and users
const emailSchema = z
	.string({
		required_error: 'Email is required.',
		invalid_type_error: 'Email must be a string.',
	})
	.email('Email is not valid.');

const firstNameSchema = generateNameSchema('First name', 3, 10);

const lastNameSchema = generateNameSchema('Last name', 3, 10);

const passwordSchema = z
	.string({
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

const roleSchema = z.nativeEnum(Role, {
	errorMap: () => ({ message: 'Role is not valid.' }),
});

export const userSchema = z.object({
	email: emailSchema,
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	password: passwordSchema,
	role: roleSchema,
});

// Schemas for expense categories
export const nameSchema = generateNameSchema('Name', 3, 15);

export const descriptionSchema = z
	.string({
		required_error: 'Description is required.',
		invalid_type_error: 'Description must be a string.',
	})
	.nonempty('Description can not be empty.');
