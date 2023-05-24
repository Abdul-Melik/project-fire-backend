import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import * as ExpensesInterfaces from '../interfaces/expenses';
import { UserModel, UserRole } from '../models/user';
import { ExpenseCategoryModel } from '../models/expense-category';
import { ExpenseModel } from '../models/expense';

export const createExpense: RequestHandler<
	unknown,
	ExpensesInterfaces.CreateExpenseRes,
	ExpensesInterfaces.CreateExpenseReq,
	unknown
> = async (req, res, next) => {
	try {
		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin) throw createHttpError(403, 'This user is not authorized to create any expense.');

		const { expenseCategory, month, year, plannedExpense } = req.body;

		if (!expenseCategory || !month || !year || !plannedExpense) throw createHttpError(400, 'Missing required fields.');

		const existingExpenseCategory = await ExpenseCategoryModel.findOne({
			name: expenseCategory,
		});
		if (!existingExpenseCategory) throw createHttpError(404, 'Expense category not found.');

		const expense = await ExpenseModel.create({
			expenseCategory: existingExpenseCategory._id,
			month,
			year,
			plannedExpense,
		});

		const expenseResponse = {
			id: expense._id,
			expenseCategory: expense.expenseCategory,
			month: expense.month,
			year: expense.year,
			plannedExpense: expense.plannedExpense,
		};

		res.status(201).json(expenseResponse);
	} catch (error) {
		next(error);
	}
};
