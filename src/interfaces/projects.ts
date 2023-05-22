import { Types } from 'mongoose';

import { ProjectType, SalesChannel, ProjectStatus } from '../models/project';
import { UserRole } from '../models/user';

interface GetProjectsRes {
	projects: {
		id: Types.ObjectId;
		name: string;
		description: string;
		startDate: Date;
		endDate: Date;
		actualEndDate?: Date;
		projectType: ProjectType;
		hourlyRate: number;
		projectValueBAM: number;
		salesChannel: SalesChannel;
		projectStatus: ProjectStatus;
		finished: boolean;
		employees: {
			employee: Types.ObjectId;
			fullTime: boolean;
		}[];
	}[];
	pageInfo: {
		total: number;
		currentPage: number;
		lastPage: number;
		perPage: number;
	};
}

interface GetProjectsQueryParams {
	name?: string;
	startDate?: Date;
	endDate?: Date;
	projectType?: ProjectType;
	salesChannel?: SalesChannel;
	projectStatus?: ProjectStatus;
	limit?: number;
	page?: number;
}

interface GetProjectByIdParams {
	projectId: string;
}

interface GetProjectByIdRes {
	id: Types.ObjectId;
	name: string;
	description: string;
	startDate: Date;
	endDate: Date;
	actualEndDate?: Date;
	projectType: ProjectType;
	hourlyRate: number;
	projectValueBAM: number;
	salesChannel: SalesChannel;
	projectStatus: ProjectStatus;
	finished: boolean;
	employees: {
		employee: Types.ObjectId;
		fullTime: boolean;
	}[];
}

interface GetEmployeesByProjectIdParams {
	projectId: string;
}

interface GetEmployeesByProjectIdRes {
	employee: {
		id: Types.ObjectId;
		firstName: string;
		lastName: string;
		department: string;
		salary: number;
		techStack: string[];
	};
	fullTime: boolean;
}

interface GetEmployeesPerProjectRes {
	id: Types.ObjectId;
	name: string;
	employees: {
		employee: {
			id: Types.ObjectId;
			firstName: string;
			lastName: string;
			department: string;
			salary: number;
			techStack: string[];
		};
		fullTime: boolean;
	}[];
}

interface GetUsersByProjectIdParams {
	projectId: string;
}

interface GetUsersByProjectIdRes {
	id: Types.ObjectId;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	image?: string;
	employee: Types.ObjectId;
}

interface GetUsersPerProjectRes {
	id: Types.ObjectId;
	name: string;
	users: {
		id: Types.ObjectId;
		firstName: string;
		lastName: string;
		role: UserRole;
		image?: string;
		employee: Types.ObjectId;
	}[];
}
interface CreateProjectRes {
	id: Types.ObjectId;
	name: string;
	description: string;
	startDate: Date;
	endDate: Date;
	actualEndDate?: Date;
	projectType: ProjectType;
	hourlyRate: number;
	projectValueBAM: number;
	salesChannel: SalesChannel;
	projectStatus: ProjectStatus;
	finished: boolean;
	employees: {
		employee: Types.ObjectId;
		fullTime: boolean;
	}[];
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
	GetEmployeesByProjectIdParams,
	GetEmployeesByProjectIdRes,
	GetEmployeesPerProjectRes,
	GetUsersByProjectIdParams,
	GetUsersByProjectIdRes,
	GetUsersPerProjectRes,
	CreateProjectRes,
	CreateProjectReq,
	DeleteProjectParams,
	DeleteProjectReq,
};
