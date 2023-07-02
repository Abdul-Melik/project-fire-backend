import { z } from 'zod';

import { ProjectType, SalesChannel, ProjectStatus } from '@prisma/client';
import { generateDateSchema } from './helpers';
import { nameSchema, descriptionSchema } from './commonSchemas';

const startDateSchema = generateDateSchema('Start date');

const endDateSchema = generateDateSchema('End date');

const actualEndDateSchema = generateDateSchema('Actual end date');

const projectTypeSchema = z.nativeEnum(ProjectType, {
	errorMap: () => ({ message: 'Project type is not valid.' }),
});

const hourlyRateSchema = z
	.number({
		required_error: 'Hourly rate is required.',
		invalid_type_error: 'Hourly rate must be a number.',
	})
	.positive('Hourly rate must be a positive number.');

const projectValueBAMSchema = z
	.number({
		required_error: 'Project value in BAM is required.',
		invalid_type_error: 'Project value in BAM must be a number.',
	})
	.positive('Project value in BAM must be a positive number.');

const salesChannelSchema = z.nativeEnum(SalesChannel, {
	errorMap: () => ({ message: 'Sales channel is not valid.' }),
});

const projectStatusSchema = z.nativeEnum(ProjectStatus, {
	errorMap: () => ({ message: 'Project status is not valid.' }),
});

const employeeSchema = z.object(
	{
		partTime: z.boolean({
			required_error: 'Part time is required.',
			invalid_type_error: 'Part time must be a boolean.',
		}),
		employeeId: z.string({
			required_error: 'Employee ID is required.',
			invalid_type_error: 'Employee ID must be a string.',
		}),
	},
	{ errorMap: () => ({ message: 'Each employee must be an object.' }) }
);

const employeesSchema = z
	.array(employeeSchema, {
		invalid_type_error: 'Employees must be an array.',
	})
	.superRefine((employees, ctx) => {
		const employeeIds = employees.map(employee => employee.employeeId);
		if (new Set(employeeIds).size !== employeeIds.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Some employees are duplicates.',
			});
		}
	});

const projectSchema = z.object({
	name: nameSchema,
	description: descriptionSchema,
	startDate: startDateSchema,
	endDate: endDateSchema,
	actualEndDate: actualEndDateSchema,
	projectType: projectTypeSchema,
	hourlyRate: hourlyRateSchema,
	projectValueBAM: projectValueBAMSchema,
	salesChannel: salesChannelSchema,
	projectStatus: projectStatusSchema,
	employees: employeesSchema,
});

export const createProjectSchema = z.object({
	body: projectSchema.partial({
		actualEndDate: true,
		projectStatus: true,
		employees: true,
	}),
});

export const updateProjectSchema = z.object({
	body: projectSchema.partial(),
});
