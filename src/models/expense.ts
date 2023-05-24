import { InferSchemaType, Schema, model } from 'mongoose';

const months = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

const expenseSchema = new Schema({
	expenseCategory: {
		type: Schema.Types.ObjectId,
		ref: 'ExpenseCategory',
		required: true,
	},
	month: {
		type: String,
		enum: months,
		required: true,
	},
	year: { type: Number, required: true },
	plannedExpense: { type: Number, required: true },
	actualExpense: { type: Number },
});

type Expense = InferSchemaType<typeof expenseSchema>;

const ExpenseModel = model<Expense>('Expense', expenseSchema);

export { ExpenseModel, Expense };
