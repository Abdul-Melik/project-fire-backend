import { z } from "zod";

import { Department, Currency, TechStack } from "@prisma/client";
import { OrderByFieldEmployeeEnum } from "./schemaEnums";
import { generateDateSchema } from "./schemaGenerators";
import {
  orderDirectionSchema,
  takeSchema,
  pageSchema,
  yearSchema,
  firstNameSchema,
  lastNameSchema,
} from "./commonSchemas";

const departmentSchema = z.nativeEnum(Department, {
  errorMap: () => ({ message: "Department is not valid." }),
});

const extendedDepartmentSchema = z.union(
  [z.literal(""), z.nativeEnum(Department)],
  {
    errorMap: () => ({ message: "Department is not valid." }),
  }
);

const salarySchema = z
  .string({
    invalid_type_error: "Salary must be a string.",
  })
  .superRefine((salary, ctx) => {
    const parsedValue = Number(salary);
    if (isNaN(parsedValue)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Salary must have a number value.",
      });
    } else if (parsedValue <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Salary must be greater than 0.",
      });
    }
  });

const currencySchema = z.nativeEnum(Currency, {
  errorMap: () => ({ message: "Currency is not valid." }),
});

const extendedCurrencySchema = z.union(
  [z.literal(""), z.nativeEnum(Currency)],
  {
    errorMap: () => ({ message: "Currency is not valid." }),
  }
);

const techStackSchema = z.nativeEnum(TechStack, {
  errorMap: () => ({ message: "Tech stack is not valid." }),
});

const extendedTechStackSchema = z.union(
  [z.literal(""), z.nativeEnum(TechStack)],
  {
    errorMap: () => ({ message: "Tech stack is not valid." }),
  }
);

const isEmployedSchema = z
  .string({
    invalid_type_error: "Is employed must be a string.",
  })
  .superRefine((value, ctx) => {
    const isEmployedValue = value === "true" || value === "false";
    if (!isEmployedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Is employed must have a boolean value.",
      });
    }
  });

const extendedIsEmployedSchema = z
  .union([z.literal(""), z.string()])
  .superRefine((value, ctx) => {
    const isEmployedValue =
      value === "" || value === "true" || value === "false";
    if (!isEmployedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Is employed must have a boolean value or be an empty string.",
      });
    }
  });

const isStandardDateFilterSchema = z
  .union([z.literal(""), z.string()])
  .superRefine((value, ctx) => {
    const isStandardDateFilterValue =
      value === "" || value === "true" || value === "false";
    if (!isStandardDateFilterValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Is standard date filter must have a boolean value or be an empty string.",
      });
    }
  });

const hiringDateSchema = z.union([z.literal(""), generateDateSchema()], {
  errorMap: () => ({ message: "Hiring date is not valid." }),
});

const terminationDateSchema = z.union([z.literal(""), generateDateSchema()], {
  errorMap: () => ({ message: "Termination date is not valid." }),
});

const orderByFieldEmployeeSchema = z.union(
  [z.literal(""), OrderByFieldEmployeeEnum],
  {
    errorMap: () => ({ message: "Order by field is not valid." }),
  }
);

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
      isStandardDateFilter: isStandardDateFilterSchema,
      hiringDate: hiringDateSchema,
      terminationDate: terminationDateSchema,
    })
    .extend({
      orderByField: orderByFieldEmployeeSchema,
      orderDirection: orderDirectionSchema,
      take: takeSchema,
      page: pageSchema,
    })
    .partial(),
});

export const getEmployeesInfoSchema = z.object({
  query: z
    .object({
      year: yearSchema,
    })
    .partial(),
});

const allowedDepartmentTechStackCombination: Record<Department, TechStack[]> = {
  [Department.Administration]: [TechStack.AdminNA],
  [Department.Management]: [TechStack.MgmtNA],
  [Department.Development]: [
    TechStack.FullStack,
    TechStack.Backend,
    TechStack.Frontend,
  ],
  [Department.Design]: [TechStack.UXUI],
};

const checkDepartmentTechStackCombination = (
  department: Department | undefined,
  techStack: TechStack | undefined,
  ctx: z.RefinementCtx
) => {
  if (
    department &&
    techStack &&
    !allowedDepartmentTechStackCombination[department].includes(techStack)
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "This combination of department and tech stack is not allowed.",
    });
  }
};

export const createEmployeeSchema = z.object({
  body: employeeSchema
    .omit({ isEmployed: true })
    .superRefine(({ department, techStack }, ctx) =>
      checkDepartmentTechStackCombination(department, techStack, ctx)
    ),
});

export const updateEmployeeSchema = z.object({
  body: employeeSchema
    .partial()
    .superRefine(({ department, techStack }, ctx) =>
      checkDepartmentTechStackCombination(department, techStack, ctx)
    ),
});
