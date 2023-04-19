import { ProjectType, SalesChannel } from '../models/project';

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
	finished?: boolean;
}

interface DeleteProjectParams {
	projectId: string;
}

interface DeleteProjectReq {
	userId: string;
}

export {
	GetProjectsRes,
	GetProjectByIdParams,
	GetProjectByIdRes,
	CreateProjectReq,
	DeleteProjectParams,
	DeleteProjectReq,
};
