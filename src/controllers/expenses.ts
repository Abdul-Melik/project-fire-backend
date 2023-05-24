import { Types } from 'mongoose';
import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import * as ExpensesInterfaces from '../interfaces/expenses';
import { UserModel, UserRole } from '../models/user';
import { ExpenseCategoryModel } from '../models/expense-category';
import { ProjectModel } from '../models/project';
import { ExpenseModel } from '../models/expense';

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

		if (!expenseCategory || !month || !year) throw createHttpError(400, 'Missing required fields.');

		const existingExpenseCategory = await ExpenseCategoryModel.findOne({
			name: expenseCategory,
		});
		if (!existingExpenseCategory) throw createHttpError(404, 'Expense category not found.');

		let calculatedPlannedExpense = 0;

		if (expenseCategory.toLowerCase() === 'direct') {
			const projects = await ProjectModel.find({
				startDate: { $lte: new Date(year, months.indexOf(month) + 1, 0) },
				endDate: { $gte: new Date(year, months.indexOf(month), 1) },
			}).populate<{
				employees: {
					employee: {
						_id: Types.ObjectId;
						firstName: string;
						lastName: string;
						department: string;
						salary: number;
						techStack: string[];
					};
					fullTime: boolean;
				}[];
			}>('employees.employee');

			calculatedPlannedExpense = projects.reduce((totalSalary, project) => {
				const projectSalary = project.employees.reduce((projectTotalSalary, employeeData) => {
					const { salary } = employeeData.employee;
					return projectTotalSalary + salary;
				}, 0);
				return totalSalary + projectSalary;
			}, 0);
		}

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
			plannedExpense: expenseCategory.toLowerCase() === 'direct' ? calculatedPlannedExpense : plannedExpense || 0,
		};

		res.status(201).json(expenseResponse);
	} catch (error) {
		next(error);
	}
};
