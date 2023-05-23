import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { Types } from 'mongoose';

import * as ProjectsInterfaces from '../interfaces/projects';
import { ProjectModel, ProjectType, SalesChannel, ProjectStatus } from '../models/project';
import { UserModel, UserRole } from '../models/user';
import { EmployeeModel } from '../models/employee';
import { stringify } from 'querystring';

type Query = {
	name?: {
		$regex: string;
		$options: string;
	};
	startDate?: {
		$gte: Date;
	};
	endDate?: {
		$lte: Date;
	};
	projectType?: ProjectType;
	salesChannel?: SalesChannel;
	projectStatus?: ProjectStatus;
	limit?: number;
	page?: number;
};

export const getProjects: RequestHandler<
	unknown,
	ProjectsInterfaces.GetProjectsRes,
	unknown,
	ProjectsInterfaces.GetProjectsQueryParams
> = async (req, res, next) => {
	try {
		const {
			name,
			startDate,
			endDate,
			projectType,
			salesChannel,
			projectStatus,
			limit = 10,
			page = 1,
			order,
			orderBy,
		} = req.query;
		const query: Query = {};

		if (name) query['name'] = { $regex: name, $options: 'i' };

		if (startDate && endDate) {
			query['startDate'] = { $gte: startDate };
			query['endDate'] = { $lte: endDate };
		}

		if (projectType) query['projectType'] = projectType;

		if (salesChannel) query['salesChannel'] = salesChannel;

		if (projectStatus) query['projectStatus'] = projectStatus;

		const count = await ProjectModel.countDocuments(query);
		const lastPage = Math.ceil(count / limit);

		const skip = (page - 1) * limit;
		const sortOptions: { [key: string]: any } = {};
		let orderVar = order === 'asc' ? 1 : -1; // "asc" === 1, "desc" === "-1
		let orderByVar = !orderBy ? 'startDate' : orderBy; // default sort by startDate

		orderBy === 'employees' // employees and projectStatus require special handling
			? (sortOptions['employeeCount'] = orderVar)
			: orderBy === 'projectStatus'
			? (sortOptions['sortPriority'] = orderVar)
			: (sortOptions[orderByVar] = orderVar);

		const projects = await ProjectModel.aggregate([
			{ $match: query },
			{ $addFields: { employeeCount: { $size: '$employees' } } }, // add employeeCount field to sort by employees
			{
				$addFields: {
					// add sortPriority field to sort by projectStatus
					sortPriority: {
						$switch: {
							branches: [
								{ case: { $eq: ['$projectStatus', 'active'] }, then: 1 },
								{ case: { $eq: ['$projectStatus', 'on-hold'] }, then: 2 },
								{ case: { $eq: ['$projectStatus', 'inactive'] }, then: 3 },
								{ case: { $eq: ['$projectStatus', 'completed'] }, then: 4 },
							],
							default: 5,
						},
					},
				},
			},
			{ $sort: sortOptions },
			{ $skip: skip },
			{ $limit: limit },
		]);
		const projectsResponse = projects.map(project => ({
			id: project._id,
			name: project.name,
			description: project.description,
			startDate: project.startDate,
			endDate: project.endDate,
			actualEndDate: project.actualEndDate,
			projectType: project.projectType,
			hourlyRate: project.hourlyRate,
			projectValueBAM: project.projectValueBAM,
			salesChannel: project.salesChannel,
			projectStatus: project.projectStatus,
			finished: project.finished,
			employees: project.employees.map((employeeObj: any) => ({
				employee: employeeObj.employee,
				fullTime: employeeObj.fullTime,
			})),
		}));

		res.status(200).json({
			projects: projectsResponse,
			pageInfo: {
				total: count,
				currentPage: Number(page),
				lastPage,
				perPage: Number(limit),
			},
		});
	} catch (error) {
		next(error);
	}
};

export const getProjectById: RequestHandler<
	ProjectsInterfaces.GetProjectByIdParams,
	ProjectsInterfaces.GetProjectByIdRes,
	unknown,
	unknown
> = async (req, res, next) => {
	try {
		const projectId = req.params.projectId;

		const project = await ProjectModel.findById(projectId);
		if (!project) throw createHttpError(404, 'Project not found.');

		const projectResponse = {
			id: project._id,
			name: project.name,
			description: project.description,
			startDate: project.startDate,
			endDate: project.endDate,
			actualEndDate: project.actualEndDate,
			projectType: project.projectType,
			hourlyRate: project.hourlyRate,
			projectValueBAM: project.projectValueBAM,
			salesChannel: project.salesChannel,
			projectStatus: project.projectStatus,
			finished: project.finished,
			employees: project.employees.map(employeeObj => ({
				employee: employeeObj.employee,
				fullTime: employeeObj.fullTime,
			})),
		};

		return res.status(200).json(projectResponse);
	} catch (error) {
		next(error);
	}
};

export const getProjectsInfo: RequestHandler = async (req, res, next) => {
	try {
		const { year } = req.query;

		const startDate = new Date(`${year}-01-01`);
		const endDate = new Date(`${year}-12-31`);

		const totalProjects = await ProjectModel.countDocuments({
			startDate: { $gte: startDate, $lte: endDate },
		});

		const totalValue = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{ $group: { _id: null, total: { $sum: '$projectValueBAM' } } },
		]);

		const averageValue = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{ $group: { _id: null, average: { $avg: '$projectValueBAM' } } },
		]);

		const averageTeamSize = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{
				$group: {
					_id: null,
					totalTeamSize: { $sum: { $size: '$employees' } },
				},
			},
			{
				$project: {
					_id: 0,
					average: {
						$cond: [{ $gt: [totalProjects, 0] }, { $divide: ['$totalTeamSize', totalProjects] }, 0],
					},
				},
			},
		]);

		const averageRate = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{ $group: { _id: null, average: { $avg: '$hourlyRate' } } },
		]);

		const salesChannelPercentage = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{
				$group: {
					_id: '$salesChannel',
					count: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					salesChannel: '$_id',
					percentage: {
						$multiply: [{ $divide: ['$count', totalProjects] }, 100],
					},
				},
			},
		]);

		const projectTypeCount = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{
				$group: {
					_id: '$projectType',
					count: { $sum: 1 },
				},
			},
			{
				$project: {
					_id: 0,
					projectType: '$_id',
					count: 1,
				},
			},
		]);

		const revenueCostProfitPerProject = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{
				$lookup: {
					from: 'employees',
					localField: 'employees.employee',
					foreignField: '_id',
					as: 'employees',
				},
			},
			{
				$project: {
					_id: 1,
					revenue: '$projectValueBAM',
					cost: { $sum: '$employees.salary' },
				},
			},
			{
				$project: {
					_id: 1,
					revenue: 1,
					cost: 1,
					profit: { $subtract: ['$revenue', '$cost'] },
				},
			},
		]);

		const totalRevenueCostProfit = await ProjectModel.aggregate([
			{ $match: { startDate: { $gte: startDate, $lte: endDate } } },
			{
				$lookup: {
					from: 'employees',
					localField: 'employees.employee',
					foreignField: '_id',
					as: 'employees',
				},
			},
			{
				$project: {
					_id: 1,
					projectValueBAM: 1,
					cost: { $sum: '$employees.salary' },
				},
			},
			{
				$group: {
					_id: null,
					totalRevenue: { $sum: '$projectValueBAM' },
					totalCost: { $sum: '$cost' },
				},
			},
			{
				$project: {
					_id: 0,
					totalRevenue: 1,
					totalCost: 1,
					totalProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
				},
			},
		]);

		res.json({
			totalProjects,
			totalValue: totalValue[0]?.total || 0,
			averageValue: averageValue[0]?.average || 0,
			averageTeamSize: averageTeamSize[0]?.average || 0,
			averageHourlyRate: averageRate[0]?.average || 0,
			salesChannelPercentage,
			projectTypeCount,
			revenueCostProfitPerProject,
			totalRevenueCostProfit,
		});
	} catch (error) {
		next(error);
	}
};

export const getEmployeesByProjectId: RequestHandler<
	ProjectsInterfaces.GetEmployeesByProjectIdParams,
	ProjectsInterfaces.GetEmployeesByProjectIdRes[],
	unknown,
	unknown
> = async (req, res, next) => {
	try {
		const projectId = req.params.projectId;

		const project = await ProjectModel.findById(projectId).populate<{
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
		if (!project) throw createHttpError(404, 'Project not found');

		const employeesResponse = project.employees.map(employeeObj => ({
			employee: {
				id: employeeObj.employee._id,
				firstName: employeeObj.employee.firstName,
				lastName: employeeObj.employee.lastName,
				department: employeeObj.employee.department,
				salary: employeeObj.employee.salary,
				techStack: employeeObj.employee.techStack,
			},
			fullTime: employeeObj.fullTime,
		}));

		res.status(200).json(employeesResponse);
	} catch (error) {
		next(error);
	}
};

export const getEmployeesPerProject: RequestHandler<
	unknown,
	ProjectsInterfaces.GetEmployeesPerProjectRes[],
	unknown,
	unknown
> = async (req, res, next) => {
	try {
		const projects = await ProjectModel.find().populate<{
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

		const projectsResponse = projects.map(project => ({
			id: project._id,
			name: project.name,
			employees: project.employees.map(employeeObj => ({
				employee: {
					id: employeeObj.employee._id,
					firstName: employeeObj.employee.firstName,
					lastName: employeeObj.employee.lastName,
					department: employeeObj.employee.department,
					salary: employeeObj.employee.salary,
					techStack: employeeObj.employee.techStack,
				},
				fullTime: employeeObj.fullTime,
			})),
		}));

		res.status(200).json(projectsResponse);
	} catch (error) {
		next(error);
	}
};

export const getUsersByProjectId: RequestHandler<
	ProjectsInterfaces.GetUsersByProjectIdParams,
	ProjectsInterfaces.GetUsersByProjectIdRes[],
	unknown,
	unknown
> = async (req, res, next) => {
	try {
		const projectId = req.params.projectId;

		const project = await ProjectModel.findById(projectId);
		if (!project) throw createHttpError(404, 'Project not found');

		const employeeIds = project.employees.map(employeeObj => employeeObj.employee._id);

		const users = await UserModel.find({ employee: { $in: employeeIds } }).select('-password');

		const usersResponse = users.map(user => ({
			id: user._id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			image: user.image,
			employee: user.employee,
		}));

		res.status(200).json(usersResponse);
	} catch (error) {
		next(error);
	}
};

export const getUsersPerProject: RequestHandler<
	unknown,
	ProjectsInterfaces.GetUsersPerProjectRes[],
	unknown,
	unknown
> = async (req, res, next) => {
	try {
		const projects = await ProjectModel.find();

		const employeeIds = projects.flatMap(project => project.employees.map(employeeObj => employeeObj.employee));

		const users = await UserModel.find({ employee: { $in: employeeIds } }).select('-password');

		const userMap = new Map();
		users.forEach(user => userMap.set(user.employee.toString(), user));

		const usersPerProject = projects.map(project => {
			const users = project.employees.map(employeeObj => userMap.get(employeeObj.employee.toString()));
			return {
				id: project._id,
				name: project.name,
				users: users.map(user => ({
					id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					role: user.role,
					image: user.image,
					employee: user.employee,
				})),
			};
		});

		res.status(200).json(usersPerProject);
	} catch (error) {
		next(error);
	}
};

export const createProject: RequestHandler<
	unknown,
	ProjectsInterfaces.CreateProjectRes,
	ProjectsInterfaces.CreateProjectReq,
	unknown
> = async (req, res, next) => {
	try {
		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');
		if (user.role !== UserRole.Admin) {
			throw createHttpError(403, 'This user is not allowed to create projects.');
		}

		const {
			name,
			description,
			startDate,
			endDate,
			actualEndDate,
			projectType,
			hourlyRate,
			projectValueBAM,
			salesChannel,
			projectStatus,
			finished,
			employees,
		} = req.body;

		if (
			!name ||
			!description ||
			!startDate ||
			!endDate ||
			!projectType ||
			!hourlyRate ||
			!projectValueBAM ||
			!salesChannel
		)
			throw createHttpError(400, 'Missing required fields.');

		const existingProject = await ProjectModel.findOne({ name });
		if (existingProject) throw createHttpError(409, 'Project already exists.');

		if (!employees || employees.some(employee => !employee || !employee.employee || employee.fullTime === undefined))
			throw createHttpError(400, 'Invalid employee data.');

		const employeeIds = employees.map(e => e.employee);
		if (new Set(employeeIds).size !== employeeIds.length) {
			throw createHttpError(400, 'Some employees are duplicates.');
		}

		const existingEmployees = await EmployeeModel.find({ _id: { $in: employeeIds } });
		if (existingEmployees.length !== employeeIds.length) throw createHttpError(400, 'Some employees do not exist.');

		const project = await ProjectModel.create({
			name,
			description,
			startDate,
			endDate,
			actualEndDate,
			projectType,
			hourlyRate,
			projectValueBAM,
			salesChannel,
			projectStatus,
			finished,
			employees,
		});

		const projectResponse = {
			id: project._id,
			name: project.name,
			description: project.description,
			startDate: project.startDate,
			endDate: project.endDate,
			actualEndDate: project.actualEndDate,
			projectType: project.projectType,
			hourlyRate: project.hourlyRate,
			projectValueBAM: project.projectValueBAM,
			salesChannel: project.salesChannel,
			projectStatus: project.projectStatus,
			finished: project.finished,
			employees: project.employees.map(employeeObj => ({
				employee: employeeObj.employee,
				fullTime: employeeObj.fullTime,
			})),
		};

		return res.status(201).json(projectResponse);
	} catch (error) {
		next(error);
	}
};

export const deleteProject: RequestHandler<
	ProjectsInterfaces.DeleteProjectParams,
	unknown,
	ProjectsInterfaces.DeleteProjectReq,
	unknown
> = async (req, res, next) => {
	try {
		const projectId = req.params.projectId;

		const project = await ProjectModel.findById(projectId);
		if (!project) throw createHttpError(404, 'Project not found.');

		const userId = req.body.userId;

		const user = await UserModel.findById(userId);
		if (!user) throw createHttpError(404, 'User not found.');
		if (user.role !== UserRole.Admin) throw createHttpError(403, 'You are not authorized to delete any project.');

		await project.deleteOne();

		return res.status(200).json({ message: 'Project deleted successfully.' });
	} catch (error) {
		next(error);
	}
};
