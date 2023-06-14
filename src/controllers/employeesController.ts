import { RequestHandler } from 'express';
import { PrismaClient, Role, Department, TechStack } from '@prisma/client';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();

// @desc    Get Employees
// @route   GET /api/employees
// @access  Private
export const getEmployees: RequestHandler = async (req, res, next) => {
	try {
		const { searchTerm = '', department, techStack, isEmployed, orderByField, orderDirection } = req.query;

		if (
			(department &&
				department !== 'Administration' &&
				department !== 'Management' &&
				department !== 'Development' &&
				department !== 'Design') ||
			(techStack &&
				techStack !== 'AdminNA' &&
				techStack !== 'MgmtNA' &&
				techStack !== 'FullStack' &&
				techStack !== 'Backend' &&
				techStack !== 'Frontend' &&
				techStack !== 'UXUI') ||
			(isEmployed && isEmployed !== 'true' && isEmployed !== 'false') ||
			(orderByField &&
				orderByField !== 'firstName' &&
				orderByField !== 'lastName' &&
				orderByField !== 'department' &&
				orderByField !== 'salary' &&
				orderByField !== 'techStack') ||
			(orderDirection && orderDirection !== 'asc' && orderDirection !== 'desc')
		)
			throw createHttpError(400, 'Invalid input fields.');

		let orderBy;
		if (orderByField && orderDirection)
			orderBy = {
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

		if (
			isNaN(salary) ||
			salary <= 0 ||
			(department !== 'Administration' &&
				department !== 'Management' &&
				department !== 'Development' &&
				department !== 'Design') ||
			(techStack !== 'AdminNA' &&
				techStack !== 'MgmtNA' &&
				techStack !== 'FullStack' &&
				techStack !== 'Backend' &&
				techStack !== 'Frontend' &&
				techStack !== 'UXUI') ||
			(department === 'Administration' && techStack !== 'AdminNA') ||
			(department === 'Management' && techStack !== 'MgmtNA') ||
			(department === 'Development' &&
				techStack !== 'FullStack' &&
				techStack !== 'Backend' &&
				techStack !== 'Frontend') ||
			(department === 'Design' && techStack !== 'UXUI')
		)
			throw createHttpError(400, 'Invalid input fields.');

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

		if (
			(salary && (isNaN(salary) || salary <= 0)) ||
			(department &&
				department !== 'Administration' &&
				department !== 'Management' &&
				department !== 'Development' &&
				department !== 'Design') ||
			(techStack &&
				techStack !== 'AdminNA' &&
				techStack !== 'MgmtNA' &&
				techStack !== 'FullStack' &&
				techStack !== 'Backend' &&
				techStack !== 'Frontend' &&
				techStack !== 'UXUI') ||
			(department &&
				!techStack &&
				((department === 'Administration' && employee.techStack !== 'AdminNA') ||
					(department === 'Management' && employee.techStack !== 'MgmtNA') ||
					(department === 'Development' &&
						employee.techStack !== 'FullStack' &&
						employee.techStack !== 'Backend' &&
						employee.techStack !== 'Frontend') ||
					(department === 'Design' && employee.techStack !== 'UXUI'))) ||
			(techStack &&
				!department &&
				((techStack === 'AdminNA' && employee.department !== 'Administration') ||
					(techStack === 'MgmtNA' && employee.department !== 'Management') ||
					((techStack === 'FullStack' || techStack === 'Backend' || techStack === 'Frontend') &&
						employee.department !== 'Development') ||
					(techStack === 'UXUI' && employee.department !== 'Design'))) ||
			(department &&
				techStack &&
				((department === 'Administration' && techStack !== 'AdminNA') ||
					(department === 'Management' && techStack !== 'MgmtNA') ||
					(department === 'Development' &&
						techStack !== 'FullStack' &&
						techStack !== 'Backend' &&
						techStack !== 'Frontend') ||
					(department === 'Design' && techStack !== 'UXUI')))
		)
			throw createHttpError(400, 'Invalid input fields.');

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
