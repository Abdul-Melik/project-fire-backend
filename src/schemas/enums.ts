import { z } from 'zod';

export const OrderByFieldEmployeeEnum = z.enum(['firstName', 'lastName', 'department', 'salary', 'techStack']);

export const OrderByFieldProjectEnum = z.enum([
	'name',
	'description',
	'startDate',
	'endDate',
	'projectType',
	'hourlyRate',
	'projectValueBAM',
	'salesChannel',
	'projectStatus',
	'employeesCount',
]);

export const OrderByFieldInvoiceEnum = z.enum([
	'client',
	'industry',
	'totalHoursBilled',
	'amountBilledBAM',
	'invoiceStatus',
]);

export const OrderDirectionEnum = z.enum(['asc', 'desc']);
