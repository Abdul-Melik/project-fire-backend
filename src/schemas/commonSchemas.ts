import { z } from "zod";

import { Role } from "@prisma/client";
import {
  generatePaginationSchema,
  generateNameSchema,
  generateNonEmptyStringSchema,
  generateDateSchema,
} from "./schemaGenerators";
import { OrderDirectionEnum } from "./schemaEnums";

export const orderDirectionSchema = z.union(
  [z.literal(""), OrderDirectionEnum],
  {
    errorMap: () => ({ message: "Order direction is not valid." }),
  }
);

export const takeSchema = z.union([
  z.literal(""),
  generatePaginationSchema("Take"),
]);

export const pageSchema = z.union([
  z.literal(""),
  generatePaginationSchema("Page"),
]);

const emailSchema = z
  .string({
    required_error: "Email is required.",
    invalid_type_error: "Email must be a string.",
  })
  .email("Email is not valid.");

export const firstNameSchema = generateNameSchema("First name", 3, 10);

export const lastNameSchema = generateNameSchema("Last name", 3, 10);

const passwordSchema = z
  .string({
    required_error: "Password is required.",
    invalid_type_error: "Password must be a string.",
  })
  .min(6, "Password must be at least 6 characters long.")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must contain at least one number.",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must contain at least one non-alphanumeric character.",
  });

const roleSchema = z.nativeEnum(Role, {
  errorMap: () => ({ message: "Role is not valid." }),
});

export const userSchema = z.object({
  email: emailSchema,
  firstName: firstNameSchema,
  lastName: lastNameSchema,
  password: passwordSchema,
  role: roleSchema,
});

export const yearSchema = z.string().superRefine((year, ctx) => {
  const parsedValue = Number(year);
  const isIntegerString = Number.isInteger(parsedValue);
  if (!isIntegerString) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Year must have an integer value.",
    });
  }
});

export const nameSchema = generateNameSchema("Name", 3, 15);

export const descriptionSchema = generateNonEmptyStringSchema("Description");

export const startDateSchema = z.union([z.literal(""), generateDateSchema()], {
  errorMap: () => ({ message: "Start date is not valid." }),
});

export const endDateSchema = z.union([z.literal(""), generateDateSchema()], {
  errorMap: () => ({ message: "End date is not valid." }),
});
