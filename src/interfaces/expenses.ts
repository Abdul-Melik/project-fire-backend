import { Types } from 'mongoose';

interface CreateExpenseRes {
	id: Types.ObjectId;
	expenseCategory: Types.ObjectId;
	month: string;
	year: number;
	plannedExpense: number;
}

interface CreateExpenseReq {
	userId: string;
	expenseCategory?: string;
	month?: string;
	year?: number;
	plannedExpense?: number;
}

export { CreateExpenseRes, CreateExpenseReq };
