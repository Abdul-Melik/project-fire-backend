import { RequestHandler } from 'express';
import createHttpError from 'http-errors';

import * as ProjectsInterfaces from '../interfaces/projects';
import { ProjectModel, ProjectType, SalesChannel, ProjectStatus } from '../models/project';
import { UserModel, UserRole } from '../models/user';
import { EmployeeModel } from '../models/employee';

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
		const { name, startDate, endDate, projectType, salesChannel, projectStatus, limit = 10, page = 1 } = req.query;
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

		const projects = await ProjectModel.find(query).populate('employees.employee').skip(skip).limit(limit);

		res.status(200).json({
			projects,
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

		const project = await ProjectModel.findById(projectId).populate('employees.employee');
		if (!project) throw createHttpError(404, 'Project not found.');

		return res.status(200).json(project);
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

export const createProject: RequestHandler<unknown, unknown, ProjectsInterfaces.CreateProjectReq, unknown> = async (
	req,
	res,
	next
) => {
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

		const populatedProject = await ProjectModel.findById(project._id).populate('employees.employee');

		return res.status(201).json(populatedProject);
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
