import { RefinementCtx, z } from "zod";

import { ProjectType, SalesChannel, ProjectStatus } from "@prisma/client";
import {
  generateDateRangeSchema,
  generatePositiveNumberSchemas,
} from "./schemaGenerators";
import { OrderByFieldProjectEnum } from "./schemaEnums";
import {
  orderDirectionSchema,
  takeSchema,
  pageSchema,
  nameSchema,
  descriptionSchema,
  startDateSchema,
  endDateSchema,
} from "./commonSchemas";

const yearSchema = z.string().superRefine((year, ctx) => {
  const parsedValue = Number(year);
  const isIntegerString = Number.isInteger(parsedValue);
  if (!isIntegerString) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Year must have an integer value.",
    });
  }
});

const minDate = new Date("2000-01-01");

const maxDate = new Date("2050-12-31");

const startDateRangeSchema = generateDateRangeSchema(
  "Start date",
  minDate,
  maxDate
);

const endDateRangeSchema = generateDateRangeSchema(
  "End date",
  minDate,
  maxDate
);

const actualEndDateRangeSchema = generateDateRangeSchema(
  "Actual end date",
  minDate,
  maxDate
);

const projectTypeSchema = z.nativeEnum(ProjectType, {
  errorMap: () => ({ message: "Project type is not valid." }),
});

const extendedProjectTypeSchema = z.union(
  [z.literal(""), z.nativeEnum(ProjectType)],
  {
    errorMap: () => ({ message: "Project type is not valid." }),
  }
);

const hourlyRateSchema = generatePositiveNumberSchemas("Hourly rate");

const projectValueBAMSchema = generatePositiveNumberSchemas("Project value");

const salesChannelSchema = z.nativeEnum(SalesChannel, {
  errorMap: () => ({ message: "Sales channel is not valid." }),
});

const extendedSalesChannelSchema = z.union(
  [z.literal(""), z.nativeEnum(SalesChannel)],
  {
    errorMap: () => ({ message: "Sales channel is not valid." }),
  }
);

const projectStatusSchema = z.nativeEnum(ProjectStatus, {
  errorMap: () => ({ message: "Project status is not valid." }),
});

const extendedProjectStatusSchema = z.union(
  [z.literal(""), z.nativeEnum(ProjectStatus)],
  {
    errorMap: () => ({ message: "Project status is not valid." }),
  }
);

const employeeSchema = z.object(
  {
    partTime: z.boolean({
      required_error: "Part time is required.",
      invalid_type_error: "Part time must be a boolean.",
    }),
    employeeId: z.string({
      required_error: "Employee ID is required.",
      invalid_type_error: "Employee ID must be a string.",
    }),
  },
  { errorMap: () => ({ message: "Each employee must be an object." }) }
);

const employeesSchema = z
  .array(employeeSchema, {
    invalid_type_error: "Employees must be an array.",
  })
  .superRefine((employees, ctx) => {
    const employeeIds = employees.map((employee) => employee.employeeId);
    if (new Set(employeeIds).size !== employeeIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Some employees are duplicates.",
      });
    }
  });

const orderByFieldProjectSchema = z.union(
  [z.literal(""), OrderByFieldProjectEnum],
  {
    errorMap: () => ({ message: "Order by field is not valid." }),
  }
);

const projectSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  startDate: startDateRangeSchema,
  endDate: endDateRangeSchema,
  actualEndDate: actualEndDateRangeSchema,
  projectType: projectTypeSchema,
  hourlyRate: hourlyRateSchema,
  projectValueBAM: projectValueBAMSchema,
  salesChannel: salesChannelSchema,
  projectStatus: projectStatusSchema,
  employees: employeesSchema,
});

export const getProjectSchema = z.object({
  query: z
    .object({
      startDate: startDateSchema,
      endDate: endDateSchema,
      projectType: extendedProjectTypeSchema,
      salesChannel: extendedSalesChannelSchema,
      projectStatus: extendedProjectStatusSchema,
      orderByField: orderByFieldProjectSchema,
      orderDirection: orderDirectionSchema,
      take: takeSchema,
      page: pageSchema,
    })
    .partial(),
});

export const getProjectsInfoSchema = z.object({
  query: z
    .object({
      year: yearSchema,
    })
    .partial(),
});

const checkProjectDatesCombination = (
  startDate: Date | undefined,
  endDate: Date | undefined,
  actualEndDate: Date | undefined,
  ctx: RefinementCtx
) => {
  if (startDate && endDate && endDate < startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End date must be after start date.",
    });
  }
  if (startDate && actualEndDate && actualEndDate < startDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Actual end date must be after start date.",
    });
  }
};

export const createProjectSchema = z.object({
  body: projectSchema
    .partial({
      actualEndDate: true,
      projectStatus: true,
      employees: true,
    })
    .superRefine(({ startDate, endDate, actualEndDate }, ctx) =>
      checkProjectDatesCombination(startDate, endDate, actualEndDate, ctx)
    ),
});

export const updateProjectSchema = z.object({
  body: projectSchema
    .partial()
    .superRefine(({ startDate, endDate, actualEndDate }, ctx) =>
      checkProjectDatesCombination(startDate, endDate, actualEndDate, ctx)
    ),
});
