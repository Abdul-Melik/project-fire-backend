import { RequestHandler } from 'express';
import { ProjectModel, ProjectType, SalesChannel } from '../models/project';
import createHttpError from 'http-errors';
import { UserModel, UserRole } from '../models/user';

interface GetProjectsResponse {
	name?: string;
	description?: string;
	startDate?: Date;
	endDate?: Date;
	actualEndDate?: Date;
	projectType?: ProjectType;
	hourlyRate?: number;
	projectValueBAM?: number;
	salesChannel?: SalesChannel;
	finished?: boolean;
}

export const getProjects: RequestHandler<unknown, GetProjectsResponse[], unknown, unknown> = async (req, res, next) => {
	try {
		const projects = await ProjectModel.find();
		res.status(200).json(projects);
	} catch (error) {
		next(error);
	}
};

interface CreateProjectBody {
	userId: string;
	name?: string;
	description?: string;
	startDate?: Date;
	endDate?: Date;
	actualEndDate?: Date;
	projectType?: ProjectType;
	hourlyRate?: number;
	projectValueBAM?: number;
	salesChannel?: SalesChannel;
	finished?: boolean;
}

export const createProject: RequestHandler<unknown, unknown, CreateProjectBody, unknown> = async (req, res, next) => {
	try {
		const userId = req.body.userId;
		const user = await UserModel.findById(userId);

		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin) {
			throw createHttpError(403, 'This user is not allowed to create a project.');
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
			finished,
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
			finished,
		});

		return res.status(201).json(project);
	} catch (error) {
		next(error);
	}
};
