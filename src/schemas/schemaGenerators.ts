import { z } from 'zod';

// Used to generate schemas for take and page which are used during pagination
export const generatePaginationSchema = (key: string) =>
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

// Used to generate schemas for firstName, lastName and name
export const generateNameSchema = (key: string, min: number, max: number) =>
	z
		.string({
			required_error: `${key} is required.`,
			invalid_type_error: `${key} must be a string.`,
		})
		.min(min, `${key} must be at least ${min} characters long.`)
		.max(max, `${key} can't be more than ${max} characters long.`);

// Used to generate schemas for description, client and industry
export const generateNonEmptyStringSchema = (key: string) =>
	z
		.string({
			required_error: `${key} is required.`,
			invalid_type_error: `${key} must be a string.`,
		})
		.nonempty(`${key} can't be empty.`);

// Used to generate schemas for salary, hourlyRate, projectValueBAM, totalHoursBilled and amountBilledBAM
export const generateNumberSchemas = (key: string) =>
	z.number({
		required_error: `${key} is required.`,
		invalid_type_error: `${key} must be a number.`,
	});

export const generatePositiveNumberSchemas = (key: string) =>
	generateNumberSchemas(key).positive(`${key} must be a positive number.`);

export const generateIntegerNumberSchemas = (key: string) =>
	generateNumberSchemas(key).int(`${key} must be an integer.`);

export const generatePositiveIntegerNumberSchemas = (key: string) =>
	generateIntegerNumberSchemas(key).positive(`${key} must be a positive integer.`);

export const generateNumberRangeSchemas = (key: string, min: number, max: number) =>
	generateNumberSchemas(key).min(min, `${key} must be at least ${min}.`).max(max, `${key} can't be more than ${max}.`);

export const generateIntegerNumberRangeSchemas = (key: string, min: number, max: number) =>
	generateIntegerNumberSchemas(key)
		.min(min, `${key} must be at least ${min}.`)
		.max(max, `${key} can't be more than ${max}.`);

// Used to generate schemas for rememberMe and isEmployed
export const generateBooleanSchema = (key: string) =>
	z.boolean({
		required_error: `${key} is required.`,
		invalid_type_error: `${key} must be a boolean.`,
	});

// Used to generate schemas for startDate, endDate and actualEndDate
const dateLike = z.union([z.string(), z.date()], {
	errorMap: () => ({ message: 'This is not a valid date.' }),
});

export const generateDateSchema = (key: string) =>
	dateLike.pipe(z.coerce.date({ errorMap: () => ({ message: 'This is not a valid date.' }) }));

export const generateDateRangeSchema = (key: string, min: Date, max: Date) =>
	dateLike.pipe(
		z.coerce
			.date({ errorMap: () => ({ message: 'This is not a valid date.' }) })
			.min(min, `${key} can't be before year ${min.getFullYear()}.`)
			.max(max, `${key} can't be after year ${max.getFullYear()}.`)
	);
