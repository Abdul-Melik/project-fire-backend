import { z } from 'zod';

import { userSchema } from './commonSchemas';

const rememberMeSchema = z
	.boolean({
		invalid_type_error: 'Remember me must be a boolean.',
	})
	.optional();

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
