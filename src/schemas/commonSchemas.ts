import { z } from 'zod';

import { Role } from '@prisma/client';
import { OrderDirectionEnum } from './enums';

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
			const parsedValue = Number(value);
			const isIntegerString = Number.isInteger(parsedValue);
			if (!isIntegerString) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${key} must have an integer value.`,
				});
			} else if (parsedValue < 1) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `${key} must be greater than 0.`,
				});
			}
		});

// Schemas for sorting and pagination
export const orderDirectionSchema = z.union([z.literal(''), OrderDirectionEnum], {
	errorMap: () => ({ message: 'Order direction is not valid.' }),
});

export const takeSchema = z.union([z.literal(''), generatePaginationSchema('Take')]);

export const pageSchema = z.union([z.literal(''), generatePaginationSchema('Page')]);

// Schemas for auth, users and employees
const emailSchema = z
	.string({
		required_error: 'Email is required.',
		invalid_type_error: 'Email must be a string.',
	})
	.email('Email is not valid.');

export const firstNameSchema = generateNameSchema('First name', 3, 10);

export const lastNameSchema = generateNameSchema('Last name', 3, 10);

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
	.nonempty("Description can't be empty.");
