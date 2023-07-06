import { z } from "zod";

import { generateBooleanSchema } from "./schemaGenerators";
import { userSchema } from "./commonSchemas";

const rememberMeSchema = generateBooleanSchema("Remember me").optional();

export const registerUserSchema = z.object({
  body: userSchema.partial({
    role: true,
  }),
});

export const loginUserSchema = z.object({
  body: userSchema
    .pick({
      email: true,
      password: true,
    })
    .extend({
      rememberMe: rememberMeSchema,
    }),
});

export const sendResetPasswordEmailSchema = z.object({
  body: userSchema.pick({
    email: true,
  }),
});
