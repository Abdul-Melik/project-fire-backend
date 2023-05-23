import { InferSchemaType, Schema, model } from 'mongoose';

const expenseCategorySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
});

type ExpenseCategory = InferSchemaType<typeof expenseCategorySchema>;

const ExpenseCategoryModel = model<ExpenseCategory>('Expense Category', expenseCategorySchema);

export { ExpenseCategoryModel, ExpenseCategory };
