import { z } from "zod";

export const OrderByFieldEmployeeEnum = z.enum([
  "firstName",
  "lastName",
  "department",
  "salary",
  "techStack",
]);

export const OrderByFieldProjectEnum = z.enum([
  "name",
  "description",
  "startDate",
  "endDate",
  "projectType",
  "hourlyRate",
  "projectValueBAM",
  "projectVelocity",
  "salesChannel",
  "projectStatus",
  "employeesCount",
]);

export const OrderByFieldInvoiceEnum = z.enum([
  "client",
  "industry",
  "totalHoursBilled",
  "amountBilledBAM",
  "invoiceStatus",
]);

export const OrderDirectionEnum = z.enum(["asc", "desc"]);

export const MonthEnum = z.enum(
  [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  {
    required_error: "Month is required",
    invalid_type_error: "Month is not valid.",
  }
);
