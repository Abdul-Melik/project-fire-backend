import { RequestHandler } from 'express';
import { PrismaClient, Role, Department, TechStack } from '@prisma/client';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();

// @desc    Get Employees
// @route   GET /api/employees
// @access  Private
export const getEmployees: RequestHandler = async (req, res, next) => {
	try {
		const {
			searchTerm = '',
			department,
			techStack,
			isEmployed,
			orderByField = 'firstName',
			orderDirection = 'desc',
		} = req.query;

		const orderByFields = ['firstName', 'lastName', 'department', 'salary', 'techStack'];
		const orderDirections = ['asc', 'desc'];
		if (!orderByFields.includes(orderByField as string) || !orderDirections.includes(orderDirection as string))
			throw createHttpError(400, 'Invalid sort option.');

		const orderBy = {
			[orderByField as string]: orderDirection,
		};

		const employees = await prisma.employee.findMany({
			where: {
				OR: [
					{
						AND: [
							{
								firstName: {
									contains: searchTerm && searchTerm.toString().split(' ')[0],
									mode: 'insensitive',
								},
							},
							{
								lastName: {
									contains: searchTerm && searchTerm.toString().split(' ')[1],
									mode: 'insensitive',
								},
							},
						],
					},
					{
						firstName: {
							contains: searchTerm && searchTerm.toString(),
							mode: 'insensitive',
						},
					},
					{
						lastName: {
							contains: searchTerm && searchTerm.toString(),
							mode: 'insensitive',
						},
					},
				],
				department: department ? (department as Department) : undefined,
				techStack: techStack ? (techStack as TechStack) : undefined,
				isEmployed: isEmployed ? JSON.parse(isEmployed as string) : undefined,
			},
			orderBy,
		});

		return res.status(200).json(employees);
	} catch (error) {
		next(error);
	}
};

// @desc    Get Employee By Id
// @route   GET /api/employees/:employeeId
// @access  Private
export const getEmployeeById: RequestHandler = async (req, res, next) => {
	try {
		const employeeId = req.params.employeeId;
		const employee = await prisma.employee.findUnique({
			where: {
				id: employeeId,
			},
		});
		if (!employee) throw createHttpError(404, 'Employee not found.');

		return res.status(200).json(employee);
	} catch (error) {
		next(error);
	}
};

// @desc    Create Employee
// @route   POST /api/employees
// @access  Private
export const createEmployee: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, 'This user is not allowed to create employees.');

		const { firstName, lastName, department, salary, techStack } = req.body;
		if (!firstName || !lastName || !department || !salary || !techStack)
			throw createHttpError(400, 'Missing required fields.');

		if (salary <= 0) throw createHttpError(400, 'Invalid input fields.');

		let imageData: string | undefined;
		if (req.file) {
			imageData = 'https://www.dmarge.com/wp-content/uploads/2021/01/dwayne-the-rock-.jpg';
		}

		const employee = await prisma.employee.create({
			data: {
				firstName,
				lastName,
				image: imageData,
				department,
				salary: parseFloat(salary),
				techStack,
			},
		});

		return res.status(201).json(employee);
	} catch (error) {
		next(error);
	}
};

// @desc    Update Employee
// @route   PATCH /api/employees/:employeeId
// @access  Private
export const updateEmployee: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, 'This user is not allowed to update employees.');

		const employeeId = req.params.employeeId;
		const employee = await prisma.employee.findUnique({
			where: {
				id: employeeId,
			},
		});
		if (!employee) throw createHttpError(404, 'Employee not found.');

		const { firstName, lastName, department, salary, techStack, isEmployed } = req.body;
		if (salary <= 0) throw createHttpError(400, 'Invalid input fields.');

		let imageData: string | undefined;
		if (req.file) {
			imageData = 'https://www.dmarge.com/wp-content/uploads/2021/01/dwayne-the-rock-.jpg';
		}

		const updatedEmployee = await prisma.employee.update({
			where: {
				id: employeeId,
			},
			data: {
				firstName,
				lastName,
				image: imageData,
				department,
				salary: salary ? parseFloat(salary) : undefined,
				techStack,
				isEmployed: isEmployed ? JSON.parse(isEmployed as string) : undefined,
			},
		});

		return res.status(200).json(updatedEmployee);
	} catch (error) {
		next(error);
	}
};

// @desc    Delete Employee
// @route   DELETE /api/employees/:employeeId
// @access  Private
export const deleteEmployee: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, 'This user is not allowed to delete employees.');

		const employeeId = req.params.employeeId;
		const employee = await prisma.employee.findUnique({
			where: {
				id: employeeId,
			},
		});
		if (!employee) throw createHttpError(404, 'Employee not found.');

		await prisma.employee.delete({
			where: {
				id: employeeId,
			},
		});

		return res.sendStatus(204);
	} catch (error) {
		next(error);
	}
};
