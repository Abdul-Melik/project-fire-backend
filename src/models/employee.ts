import { InferSchemaType, Schema, model } from 'mongoose';

const employeeSchema = new Schema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: {
		type: String,
		required: true,
	},
	department: {
		type: String,
		default: 'none',
	},
	salary: {
		type: Number,
		default: 0,
	},
	techStack: {
		type: [String],
		default: [],
	},
	image: {
		type: String,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
});

type Employee = InferSchemaType<typeof employeeSchema>;

const EmployeeModel = model<Employee>('Employee', employeeSchema);

export { EmployeeModel, Employee };
