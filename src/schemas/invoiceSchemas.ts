import { z } from "zod";

import { InvoiceStatus } from "@prisma/client";
import {
  generatePositiveNumberSchemas,
  generatePositiveIntegerNumberSchemas,
  generateNonEmptyStringSchema,
} from "./schemaGenerators";
import { OrderByFieldInvoiceEnum } from "./schemaEnums";
import { orderDirectionSchema, takeSchema, pageSchema } from "./commonSchemas";

const clientSchema = generateNonEmptyStringSchema("Client");

const industrySchema = generateNonEmptyStringSchema("Industry");

const totalHoursBilledSchema =
  generatePositiveIntegerNumberSchemas("Total hours billed");

const amountBilledBAMSchema = generatePositiveNumberSchemas("Amount billed");

const invoiceStatusSchema = z.nativeEnum(InvoiceStatus, {
  errorMap: () => ({ message: "Invoice status is not valid." }),
});

const extendedInvoiceStatusSchema = z.union(
  [z.literal(""), z.nativeEnum(InvoiceStatus)],
  {
    errorMap: () => ({ message: "Invoice status is not valid." }),
  }
);

const orderByFieldInvoiceSchema = z.union(
  [z.literal(""), OrderByFieldInvoiceEnum],
  {
    errorMap: () => ({ message: "Order by field is not valid." }),
  }
);

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
