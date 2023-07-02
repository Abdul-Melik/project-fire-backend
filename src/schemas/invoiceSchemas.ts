import { z } from 'zod';

import { InvoiceStatus } from '@prisma/client';
import { orderDirectionSchema, takeSchema, pageSchema } from './commonSchemas';
import { OrderByFieldInvoiceEnum } from './enums';

const clientSchema = z
	.string({
		required_error: 'Client is required.',
		invalid_type_error: 'Client must be a string.',
	})
	.nonempty("Client can't be empty.");

const industrySchema = z
	.string({
		required_error: 'Industry is required.',
		invalid_type_error: 'Industry must be a string.',
	})
	.nonempty("Industry can't be empty.");

const totalHoursBilledSchema = z
	.number({
		required_error: 'Total hours billed is required.',
		invalid_type_error: 'Total hours billed must be a number.',
	})
	.int('Total hours billed must be an integer.')
	.positive('Total hours billed must be a positive number.');

const amountBilledBAMSchema = z
	.number({
		required_error: 'Amount billed is required.',
		invalid_type_error: 'Amount billed must be a number.',
	})
	.positive('Amount billed must be a positive number.');

const invoiceStatusSchema = z.nativeEnum(InvoiceStatus, {
	errorMap: () => ({ message: 'Invoice status is not valid.' }),
});

const extendedInvoiceStatusSchema = z.union([z.literal(''), z.nativeEnum(InvoiceStatus)], {
	errorMap: () => ({ message: 'Invoice status is not valid.' }),
});

const orderByFieldInvoiceSchema = z.union([z.literal(''), OrderByFieldInvoiceEnum], {
	errorMap: () => ({ message: 'Order by field is not valid.' }),
});

const invoiceSchema = z.object({
	client: clientSchema,
	industry: industrySchema,
	totalHoursBilled: totalHoursBilledSchema,
	amountBilledBAM: amountBilledBAMSchema,
	invoiceStatus: invoiceStatusSchema,
});

export const getInvoicesSchema = z.object({
	query: z
		.object({ invoiceStatus: extendedInvoiceStatusSchema })
		.extend({
			orderByField: orderByFieldInvoiceSchema,
			orderDirection: orderDirectionSchema,
			take: takeSchema,
			page: pageSchema,
		})
		.partial(),
});

export const createInvoiceSchema = z.object({
	body: invoiceSchema,
});

export const updateInvoiceSchema = z.object({
	body: invoiceSchema.partial(),
});
