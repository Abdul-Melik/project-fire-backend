import { Types } from 'mongoose';

import { ProjectType, SalesChannel, ProjectStatus } from '../models/project';

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
	projectStatus?: ProjectStatus;
	finished?: boolean;
}

interface GetProjectsQueryParams {
	name?: string;
	startDate?: Date;
	endDate?: Date;
	projectType?: ProjectType;
	salesChannel?: SalesChannel;
	projectStatus?: ProjectStatus;
}

interface GetProjectByIdParams {
	projectId: string;
}

interface GetProjectByIdRes {
	name?: string;
	description?: string;
	startDate?: Date;
	endDate?: Date;
	actualEndDate?: Date;
	projectType?: ProjectType;
	hourlyRate?: number;
	projectValueBAM?: number;
	salesChannel?: SalesChannel;
	projectStatus?: ProjectStatus;
	finished?: boolean;
}

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
	projectStatus?: ProjectStatus;
	finished?: boolean;
	employees?: [
		{
			employee?: Types.ObjectId;
			fullTime?: boolean;
		}
	];
}

interface DeleteProjectParams {
	projectId: string;
}

interface DeleteProjectReq {
	userId: string;
}

export {
	GetProjectsRes,
	GetProjectsQueryParams,
	GetProjectByIdParams,
	GetProjectByIdRes,
	CreateProjectReq,
	DeleteProjectParams,
	DeleteProjectReq,
};
