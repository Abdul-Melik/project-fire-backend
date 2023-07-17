import { z } from "zod";

import { userSchema } from "./commonSchemas";

export const updateUserSchema = z.object({
  body: userSchema.partial(),
});
