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

interface GetProjectsReq {
	userId: string;
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

interface GetProjectByIdReq {
	userId: string;
}

interface GetProjectsInfoRes {
	totalProjects: number;
	totalValue: number;
	averageValue: number;
	averageTeamSize: number;
	averageHourlyRate: number;
	salesChannelPercentage: {
		salesChannel: SalesChannel;
		percentage: number;
	}[];
	projectTypeCount: {
		count: number;
		projectType: ProjectType;
	}[];
	revenueCostProfitPerProject: {
		revenue: number;
		cost: number;
		profit: number;
	}[];
	totalRevenueCostProfit: {
		totalRevenue: number;
		totalCost: number;
		totalProfit: number;
	};
}

interface GetProjectsInfoReq {
	userId: string;
}

interface GetProjectsInfoQueryParams {
	year?: string;
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

interface GetEmployeesByProjectIdReq {
	userId: string;
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

interface GetEmployeesPerProjectReq {
	userId: string;
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

interface GetUsersByProjectIdReq {
	userId: string;
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

interface GetUsersPerProjectReq {
	userId: string;
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

interface DeleteProjectRes {
	message: string;
}

interface DeleteProjectReq {
	userId: string;
}

export {
	GetProjectsRes,
	GetProjectsReq,
	GetProjectsQueryParams,
	GetProjectByIdParams,
	GetProjectByIdRes,
	GetProjectByIdReq,
	GetProjectsInfoRes,
	GetProjectsInfoReq,
	GetProjectsInfoQueryParams,
	GetEmployeesByProjectIdParams,
	GetEmployeesByProjectIdRes,
	GetEmployeesByProjectIdReq,
	GetEmployeesPerProjectRes,
	GetEmployeesPerProjectReq,
	GetUsersByProjectIdParams,
	GetUsersByProjectIdRes,
	GetUsersByProjectIdReq,
	GetUsersPerProjectRes,
	GetUsersPerProjectReq,
	CreateProjectRes,
	CreateProjectReq,
	DeleteProjectParams,
	DeleteProjectRes,
	DeleteProjectReq,
};
