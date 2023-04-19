import { RequestHandler } from 'express';
import { ProjectModel, ProjectType, SalesChannel } from '../models/project';
import createHttpError from 'http-errors';
import { UserModel, UserRole } from '../models/user';

interface GetProjectsRes {
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

export const getProjects: RequestHandler<unknown, GetProjectsRes[], unknown, unknown> = async (req, res, next) => {
	try {
		const projects = await ProjectModel.find();
		res.status(200).json(projects);
	} catch (error) {
		next(error);
	}
};

interface CreateProjectReq {
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

export const createProject: RequestHandler<unknown, unknown, CreateProjectReq, unknown> = async (req, res, next) => {
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

interface DeleteProjectParams {
	projectId: string;
}

interface DeleteProjectReq {
	userId: string;
}

export const deleteProject: RequestHandler<DeleteProjectParams, unknown, DeleteProjectReq, unknown> = async (
	req,
	res,
	next
) => {
	try {
		const projectId = req.params.projectId;
		const project = await ProjectModel.findById(projectId);

		if (!project) throw createHttpError(404, 'Project not found.');

		const userId = req.body.userId;
		const user = await UserModel.findById(userId);

		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role !== UserRole.Admin) {
			throw createHttpError(403, 'You are not authorized to delete any project.');
		}

		await project.deleteOne();

		return res.status(200).json({ message: 'Project deleted successfully.' });
	} catch (error) {
		next(error);
	}
};
