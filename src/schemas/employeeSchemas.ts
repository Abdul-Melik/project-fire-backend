import { z } from 'zod';

import { Department, Currency, TechStack } from '@prisma/client';
import { generatePositiveNumberSchemas, generateBooleanSchema } from './helpers';
import { OrderByFieldEmployeeEnum } from './enums';
import { orderDirectionSchema, takeSchema, pageSchema, firstNameSchema, lastNameSchema } from './commonSchemas';

const allowedTechStacks: Record<Department, TechStack[]> = {
	[Department.Administration]: [TechStack.AdminNA],
	[Department.Management]: [TechStack.MgmtNA],
	[Department.Development]: [TechStack.FullStack, TechStack.Backend, TechStack.Frontend],
	[Department.Design]: [TechStack.UXUI],
};

const departmentSchema = z.nativeEnum(Department, {
	errorMap: () => ({ message: 'Department is not valid.' }),
});

const extendedDepartmentSchema = z.union([z.literal(''), z.nativeEnum(Department)], {
	errorMap: () => ({ message: 'Department is not valid.' }),
});

const salarySchema = generatePositiveNumberSchemas('Salary');

const currencySchema = z.nativeEnum(Currency, {
	errorMap: () => ({ message: 'Currency is not valid.' }),
});

const extendedCurrencySchema = z.union([z.literal(''), z.nativeEnum(Currency)], {
	errorMap: () => ({ message: 'Currency is not valid.' }),
});

const techStackSchema = z.nativeEnum(TechStack, {
	errorMap: () => ({ message: 'Tech stack is not valid.' }),
});

const extendedTechStackSchema = z.union([z.literal(''), z.nativeEnum(TechStack)], {
	errorMap: () => ({ message: 'Tech stack is not valid.' }),
});

const isEmployedSchema = generateBooleanSchema('Is employed');

const extendedIsEmployedSchema = z.union([z.literal(''), z.string()]).superRefine((value, ctx) => {
	const isEmployedValue = value === '' || value === 'true' || value === 'false';
	if (!isEmployedValue) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			message: 'Is employed must have a boolean value or be an empty string.',
		});
	}
});

const orderByFieldEmployeeSchema = z.union([z.literal(''), OrderByFieldEmployeeEnum], {
	errorMap: () => ({ message: 'Order by field is not valid.' }),
});

const employeeSchema = z.object({
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	department: departmentSchema,
	salary: salarySchema,
	currency: currencySchema,
	techStack: techStackSchema,
	isEmployed: isEmployedSchema,
});

export const getEmployeesSchema = z.object({
	query: z
		.object({
			currency: extendedCurrencySchema,
			department: extendedDepartmentSchema,
			techStack: extendedTechStackSchema,
			isEmployed: extendedIsEmployedSchema,
		})
		.extend({
			orderByField: orderByFieldEmployeeSchema,
			orderDirection: orderDirectionSchema,
			take: takeSchema,
			page: pageSchema,
		})
		.partial(),
});

export const createEmployeeSchema = z.object({
	body: employeeSchema.omit({ isEmployed: true }).superRefine(({ department, techStack }, ctx) => {
		if (!allowedTechStacks[department].includes(techStack)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'This combination of department and tech stack is not allowed.',
			});
		}
	}),
});

export const updateEmployeeSchema = z.object({
	body: employeeSchema.partial().superRefine(({ department, techStack }, ctx) => {
		if (department && techStack && !allowedTechStacks[department].includes(techStack)) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'This combination of department and tech stack is not allowed.',
			});
		}
	}),
});
