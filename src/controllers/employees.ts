import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import fs from 'fs';

import * as EmployeesInterfaces from '../interfaces/employees';
import { EmployeeModel } from '../models/employee';
import { UserModel, UserRole } from '../models/user';
import { ProjectModel } from '../models/project';

type Query = {
	firstName?: {
		$regex: string;
		$options: string;
	};
};

export const getEmployees: RequestHandler<
	unknown,
	EmployeesInterfaces.GetEmployeesRes[],
	EmployeesInterfaces.GetEmployeesReq,
	EmployeesInterfaces.GetEmployeesQueryParams
> = async (req, res, next) => {
	try {
		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		const { firstName } = req.query;
		const query: Query = {};

		if (firstName) query['firstName'] = { $regex: firstName, $options: 'i' };

		const employees = await EmployeeModel.find(query);

		const employeesResponse = employees.map(employee => ({
			id: employee._id,
			firstName: employee.firstName,
			lastName: employee.lastName,
			department: employee.department,
			salary: employee.salary,
			image: employee.image,
			techStack: employee.techStack,
		}));

		return res.status(200).json(employeesResponse);
	} catch (error) {
		next(error);
	}
};

export const getEmployeeById: RequestHandler<
	EmployeesInterfaces.GetEmployeeByIdParams,
	EmployeesInterfaces.GetEmployeeByIdRes,
	EmployeesInterfaces.GetEmployeeByIdReq,
	unknown
> = async (req, res, next) => {
	try {
		const employeeId = req.params.employeeId;

		const employee = await EmployeeModel.findById(employeeId);
		if (!employee) throw createHttpError(404, 'Employee not found.');

		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		const employeeResponse = {
			id: employee._id,
			firstName: employee.firstName,
			lastName: employee.lastName,
			department: employee.department,
			salary: employee.salary,
			techStack: employee.techStack,
			image: employee.image,
		};

		return res.status(200).json(employeeResponse);
	} catch (error) {
		next(error);
	}
};

export const addEmployee: RequestHandler<unknown, any, EmployeesInterfaces.AddEmployeeReq, unknown> = async (
	req,
	res,
	next
) => {
	try {
		const userId = req.body.userId;
		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin) throw createHttpError(403, 'This user is not authorized to add any employee.');

		const { firstName, lastName, department, salary, techStack, image } = req.body;

		if (!firstName || !lastName || !department || !salary || !techStack)
			throw createHttpError(400, 'Missing required fields.');

		let imageData: string | undefined = undefined;
		if (req.file) {
			const buffer = await fs.promises.readFile(req.file.path);
			const fileType = req.file.mimetype.split('/')[1];
			const base64EncodedData = buffer.toString('base64');
			imageData = `data:image/${fileType};base64,${base64EncodedData}`;
			await fs.promises.unlink(req.file.path);
		}

		const employee = await EmployeeModel.create({
			firstName,
			lastName,
			department,
			salary,
			techStack,
			image: imageData,
		});

		const employeeResponse = {
			id: employee._id,
			firstName: employee.firstName,
			lastName: employee.lastName,
			department: employee.department,
			salary: employee.salary,
			techStack: employee.techStack,
			image: employee.image,
		};

		return res.status(201).json(employeeResponse);
	} catch (error) {
		next(error);
	}
};

export const removeEmployee: RequestHandler<
	EmployeesInterfaces.RemoveEmployeeParams,
	EmployeesInterfaces.RemoveEmployeeRes,
	EmployeesInterfaces.RemoveEmployeeReq,
	unknown
> = async (req, res, next) => {
	try {
		const employeeId = req.params.employeeId;

		const employee = await EmployeeModel.findById(employeeId);
		if (!employee) throw createHttpError(404, 'Employee not found.');

		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin) throw createHttpError(403, 'This user is not authorized to remove any employee.');

		const userWhoIsEmployee = await UserModel.findOne({ employee: employeeId });
		if (userWhoIsEmployee && userWhoIsEmployee.id === userId)
			throw createHttpError(403, 'This user is not authorized to delete him or herself.');
		if (userWhoIsEmployee && userWhoIsEmployee.role === UserRole.Admin)
			throw createHttpError(403, 'Cannot delete an admin user.');

		const projects = await ProjectModel.find({ 'employees.employee': employeeId });
		for (const project of projects) {
			project.employees = project.employees.filter(employeeObj => employeeObj.employee.toString() !== employeeId);
			await project.save();
		}

		await employee.deleteOne();
		await userWhoIsEmployee?.deleteOne();

		return res.status(200).json({ message: 'Employee removed successfully.' });
	} catch (error) {
		next(error);
	}
};
