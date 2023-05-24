import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import * as ExpenseCategoriesInterfaces from '../interfaces/expense-categories';
import { UserModel, UserRole } from '../models/user';
import { ExpenseCategoryModel } from '../models/expense-category';

export const getExpenseCategories: RequestHandler<
	unknown,
	ExpenseCategoriesInterfaces.GetExpenseCategoriesRes[],
	ExpenseCategoriesInterfaces.GetExpenseCategoriesReq,
	unknown
> = async (req, res, next) => {
	try {
		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		const expenseCategories = await ExpenseCategoryModel.find();

		const expenseCategoriesResponse = expenseCategories.map(expenseCategory => ({
			id: expenseCategory._id,
			name: expenseCategory.name,
			description: expenseCategory.description,
		}));

		res.status(200).json(expenseCategoriesResponse);
	} catch (error) {
		next(error);
	}
};

export const getExpenseCategoryById: RequestHandler<
	ExpenseCategoriesInterfaces.GetExpenseCategoryByIdParams,
	ExpenseCategoriesInterfaces.GetExpenseCategoryByIdRes,
	ExpenseCategoriesInterfaces.GetExpenseCategoryByIdReq,
	unknown
> = async (req, res, next) => {
	try {
		const expenseCategoryId = req.params.expenseCategoryId;

		const expenseCategory = await ExpenseCategoryModel.findById(expenseCategoryId);
		if (!expenseCategory) throw createHttpError(404, 'Expense category not found.');

		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		const expenseCategoryResponse = {
			id: expenseCategory._id,
			name: expenseCategory.name,
			description: expenseCategory.description,
		};

		res.status(200).json(expenseCategoryResponse);
	} catch (error) {
		next(error);
	}
};

export const createExpenseCategory: RequestHandler<
	unknown,
	ExpenseCategoriesInterfaces.CreateExpenseCategoryRes,
	ExpenseCategoriesInterfaces.CreateExpenseCategoryReq,
	unknown
> = async (req, res, next) => {
	try {
		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin)
			throw createHttpError(403, 'This user is not authorized to create any expense category.');

		const { name, description } = req.body;
		if (!name || !description) throw createHttpError(400, 'Missing required fields.');

		const existingExpenseCategory = await ExpenseCategoryModel.findOne({ name });
		if (existingExpenseCategory) throw createHttpError(409, 'Expense category already exists.');

		const expenseCategory = await ExpenseCategoryModel.create({
			name,
			description,
		});

		const expenseCategoryResponse = {
			id: expenseCategory._id,
			name: expenseCategory.name,
			description: expenseCategory.description,
		};

		return res.status(201).json(expenseCategoryResponse);
	} catch (error) {
		next(error);
	}
};

export const deleteExpenseCategory: RequestHandler<
	ExpenseCategoriesInterfaces.DeleteExpenseCategoryParams,
	ExpenseCategoriesInterfaces.DeleteExpenseCategoryRes,
	ExpenseCategoriesInterfaces.DeleteExpenseCategoryReq,
	unknown
> = async (req, res, next) => {
	try {
		const expenseCategoryId = req.params.expenseCategoryId;

		const expenseCategory = await ExpenseCategoryModel.findById(expenseCategoryId);
		if (!expenseCategory) throw createHttpError(404, 'Expense category not found.');

		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin)
			throw createHttpError(403, 'This user is not authorized to delete any expense category.');

		await expenseCategory.deleteOne();

		return res.status(200).json({ message: 'Expense category deleted successfully.' });
	} catch (error) {
		next(error);
	}
};
