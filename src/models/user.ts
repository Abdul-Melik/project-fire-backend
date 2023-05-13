import { InferSchemaType, Schema, model } from 'mongoose';

enum UserRole {
	Admin = 'admin',
	Guest = 'guest',
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
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: Object.values(UserRole),
		default: UserRole.Guest,
		required: true,
	},
	image: {
		type: String,
	},
	employee: {
		type: Schema.Types.ObjectId,
		ref: 'Employee',
		required: true,
	},
});

type User = InferSchemaType<typeof userSchema>;

const UserModel = model<User>('User', userSchema);

export { UserModel, User, UserRole };
