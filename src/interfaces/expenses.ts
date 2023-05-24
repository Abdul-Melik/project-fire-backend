import { Types } from 'mongoose';

interface CreateExpenseRes {
	id: Types.ObjectId;
	expenseCategory: Types.ObjectId;
	month: string;
	year: number;
	plannedExpense: number;
	actualExpense: number;
}

interface CreateExpenseReq {
	userId: string;
	expenseCategory?: string;
	month?: string;
	year?: number;
	plannedExpense?: number;
	actualExpense?: number;
}

export { CreateExpenseRes, CreateExpenseReq };
