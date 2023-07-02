import { z } from 'zod';

import { Role } from '@prisma/client';
import { generatePaginationSchema, generateNameSchema, generateNonEmptyStringSchema } from './schemaGenerators';
import { OrderDirectionEnum } from './schemaEnums';

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

// Schemas for projects and expense categories
export const nameSchema = generateNameSchema('Name', 3, 15);

export const descriptionSchema = generateNonEmptyStringSchema('Description');
