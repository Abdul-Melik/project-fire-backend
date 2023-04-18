import { InferSchemaType, Schema, model } from 'mongoose';

enum UserRole {
	Admin = 'admin',
	User = 'user',
}

const userSchema = new Schema({
	email: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: Object.values(UserRole),
		required: true,
	},
	image: {
		type: String,
	},
});

type User = InferSchemaType<typeof userSchema>;

const UserModel = model<User>('User', userSchema);

export { UserModel, UserRole };
