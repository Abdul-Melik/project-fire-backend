import { RequestHandler } from 'express';
import { PrismaClient, Role, ProjectType, SalesChannel, ProjectStatus } from '@prisma/client';
import createHttpError from 'http-errors';

const prisma = new PrismaClient();

// @desc    Get Projects
// @route   GET /api/projects
// @access  Private
export const getProjects: RequestHandler = async (req, res, next) => {
	try {
		const {
			name = '',
			startDate,
			endDate,
			projectType,
			salesChannel,
			projectStatus = 'Active',
			orderByField = 'startDate',
			orderDirection = 'desc',
			take = 10,
			page = 1,
		} = req.query;

		const orderByFields = [
			'name',
			'description',
			'startDate',
			'endDate',
			'actualEndDate',
			'projectType',
			'hourlyRate',
			'projectValueBAM',
			'salesChannel',
			'projectStatus',
			'employeesCount',
		];
		const orderDirections = ['asc', 'desc'];
		if (!orderByFields.includes(orderByField as string) || !orderDirections.includes(orderDirection as string))
			throw createHttpError(400, 'Invalid sort option.');

		const count = await prisma.project.count();
		const lastPage = Math.ceil(count / Number(take));
		const skip = (Number(page) - 1) * Number(take);

		if (Number(take) < 1 || Number(page) < 1 || Number(page) > lastPage)
			throw createHttpError(400, 'Invalid pagination options.');

		let orderBy = {
			[orderByField as string]: orderDirection,
		};

		if (orderByField === 'employeesCount') {
			const employeesOrder = {
				employees: {
					_count: orderDirection,
				},
			};
			orderBy = employeesOrder;
		}

		const projects = await prisma.project.findMany({
			where: {
				name: {
					contains: name ? name.toString() : '',
					mode: 'insensitive',
				},
				...(startDate && {
					startDate: {
						gte: new Date(startDate as string),
					},
				}),
				...(endDate && {
					endDate: {
						lte: new Date(endDate as string),
					},
				}),
				projectType: projectType ? (projectType as ProjectType) : undefined,
				salesChannel: salesChannel ? (salesChannel as SalesChannel) : undefined,
				projectStatus: projectStatus ? (projectStatus as ProjectStatus) : undefined,
			},
			orderBy,
			skip,
			take: Number(take),
			include: {
				employees: {
					select: {
						partTime: true,
						employee: true,
					},
				},
			},
		});

		return res.status(200).json({
			pageInfo: {
				total: count,
				currentPage: Number(page),
				lastPage,
				perPage: Number(take),
			},
			projects,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Get Project By Id
// @route   GET /api/projects/:projectId
// @access  Private
export const getProjectById: RequestHandler = async (req, res, next) => {
	try {
		const projectId = req.params.projectId;
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
			include: {
				employees: {
					select: {
						partTime: true,
						employee: true,
					},
				},
			},
		});
		if (!project) throw createHttpError(404, 'Project not found.');

		return res.status(200).json(project);
	} catch (error) {
		next(error);
	}
};

// @desc    Get Projects Info
// @route   GET /api/projects/info
// @access  Private
export const getProjectsInfo: RequestHandler = async (req, res, next) => {
	try {
		const { year } = req.query;

		const startDate = new Date(`${year}-01-01`);
		const endDate = new Date(`${year}-12-31`);

		const yearFilter = {
			startDate: {
				gte: startDate,
			},
			endDate: {
				lte: endDate,
			},
		};

		const totalProjects = await prisma.project.count({
			where: yearFilter,
		});

		type Project = {
			name: string;
			hourlyRate: number;
			numberOfEmployees: number;
			revenue: number;
			cost: number;
			profit: number;
		};

		let totalValue = 0;
		let totalCost = 0;
		let grossProfit = 0;
		let averageValue = 0;
		let averageRate = 0;
		let averageTeamSize = 0;
		let salesChannelPercentage = {};
		let projectTypeCount = {};
		let projects: Project[] = [];

		if (totalProjects) {
			const projectsData = await prisma.project.findMany({
				where: yearFilter,
				select: {
					name: true,
					hourlyRate: true,
					projectValueBAM: true,
					_count: true,
					employees: {
						select: {
							partTime: true,
							employee: {
								select: {
									salary: true,
								},
							},
						},
					},
				},
			});

			projects = projectsData.map(project => {
				const revenue = project.projectValueBAM;
				const cost = project.employees.reduce((sum, obj) => {
					const partTime = obj.partTime;
					const salary = obj.employee.salary ?? 0;
					return sum + salary * (partTime ? 0.5 : 1);
				}, 0);
				const profit = revenue - cost;
				return {
					name: project.name,
					hourlyRate: project.hourlyRate,
					numberOfEmployees: project._count.employees,
					revenue,
					cost,
					profit,
				};
			});

			totalValue = projects.reduce((sum, project) => {
				return sum + project.revenue;
			}, 0);

			totalCost = projects.reduce((sum, project) => {
				return sum + project.cost;
			}, 0);

			const totalHourlyRate = projects.reduce((sum, project) => {
				return sum + project.hourlyRate;
			}, 0);

			const totalEmployees = projects.reduce((sum, project) => {
				const numberOfEmployees = project.numberOfEmployees;
				return sum + numberOfEmployees;
			}, 0);

			grossProfit = totalValue - totalCost;

			averageValue = totalValue / totalProjects;

			averageRate = totalHourlyRate / totalProjects;

			averageTeamSize = totalEmployees / totalProjects;

			const salesChannelCountData = await prisma.project.groupBy({
				where: yearFilter,
				by: ['salesChannel'],
				_count: {
					id: true,
				},
			});

			salesChannelPercentage = salesChannelCountData.reduce((result, obj) => {
				const count = obj._count.id;
				const percentage = (count / totalProjects) * 100;
				return {
					...result,
					[obj.salesChannel]: percentage,
				};
			}, {});

			const projectTypeCountData = await prisma.project.groupBy({
				where: yearFilter,
				by: ['projectType'],
				_count: {
					id: true,
				},
			});

			projectTypeCount = projectTypeCountData.reduce((result, obj) => {
				const count = obj._count.id;
				return {
					...result,
					[obj.projectType]: count,
				};
			}, {});
		}

		return res.status(200).json({
			totalProjects,
			totalValue,
			totalCost,
			grossProfit,
			averageValue,
			averageRate,
			averageTeamSize,
			salesChannelPercentage,
			projectTypeCount,
			projects,
		});
	} catch (error) {
		next(error);
	}
};

// @desc    Create Project
// @route   POST /api/projects
// @access  Private
export const createProject: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, 'This user is not allowed to create projects.');

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
			employeesOnProject = [],
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

		const existingProject = await prisma.project.findFirst({
			where: {
				name: {
					equals: name,
					mode: 'insensitive',
				},
			},
		});
		if (existingProject) throw createHttpError(409, 'Project already exists.');

		if (!Array.isArray(employeesOnProject)) throw createHttpError(400, 'Invalid employees data.');
		for (const employee of employeesOnProject) {
			if (
				!employee ||
				typeof employee !== 'object' ||
				typeof employee.employeeId !== 'string' ||
				typeof employee.partTime !== 'boolean'
			)
				throw createHttpError(400, 'Invalid employees data.');
		}

		const employeeIds = employeesOnProject.map(employee => employee.employeeId);
		if (new Set(employeeIds).size !== employeeIds.length) throw createHttpError(400, 'Some employees are duplicates.');

		const existingEmployees = await prisma.employee.findMany({
			where: {
				id: { in: employeeIds },
			},
			select: { id: true },
		});
		if (existingEmployees.length !== employeeIds.length) throw createHttpError(400, 'Some employees do not exist.');

		const project = await prisma.project.create({
			data: {
				name,
				description,
				startDate: new Date(startDate),
				endDate: new Date(endDate),
				actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
				projectType,
				hourlyRate,
				projectValueBAM,
				salesChannel,
				projectStatus,
				employees: {
					create: employeesOnProject.map(employee => ({
						partTime: employee.partTime,
						employee: {
							connect: {
								id: employee.employeeId,
							},
						},
					})),
				},
			},
			include: {
				employees: {
					select: {
						partTime: true,
						employee: true,
					},
				},
			},
		});

		return res.status(201).json(project);
	} catch (error) {
		next(error);
	}
};

// @desc    Update Project
// @route   POST /api/projects/:projectId
// @access  Private
export const updateProject: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, 'This user is not allowed to update projects.');

		const projectId = req.params.projectId;
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
		});
		if (!project) throw createHttpError(404, 'Project not found.');

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
			employeesOnProject,
		} = req.body;

		if (name) {
			const existingProject = await prisma.project.findFirst({
				where: {
					name: {
						equals: name,
						mode: 'insensitive',
					},
				},
			});
			if (existingProject) throw createHttpError(409, 'Project already exists.');
		}

		if (employeesOnProject) {
			if (!Array.isArray(employeesOnProject)) throw createHttpError(400, 'Invalid employees data.');
			for (const employee of employeesOnProject) {
				if (
					!employee ||
					typeof employee !== 'object' ||
					typeof employee.employeeId !== 'string' ||
					typeof employee.partTime !== 'boolean'
				)
					throw createHttpError(400, 'Invalid employees data.');
			}

			const employeeIds = employeesOnProject.map(employee => employee.employeeId);
			if (new Set(employeeIds).size !== employeeIds.length)
				throw createHttpError(400, 'Some employees are duplicates.');

			const existingEmployees = await prisma.employee.findMany({
				where: {
					id: { in: employeeIds },
				},
				select: { id: true },
			});
			if (existingEmployees.length !== employeeIds.length) throw createHttpError(400, 'Some employees do not exist.');
		}

		type Employee = {
			employeeId: string;
			partTime: boolean;
		};

		const updatedProject = await prisma.project.update({
			where: {
				id: projectId,
			},
			data: {
				name,
				description,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
				projectType,
				hourlyRate,
				projectValueBAM,
				salesChannel,
				projectStatus,
				employees: employeesOnProject
					? {
							deleteMany: {},
							create: employeesOnProject.map((employee: Employee) => ({
								partTime: employee.partTime,
								employee: {
									connect: {
										id: employee.employeeId,
									},
								},
							})),
					  }
					: undefined,
			},
			include: {
				employees: {
					select: {
						partTime: true,
						employee: true,
					},
				},
			},
		});

		return res.status(200).json(updatedProject);
	} catch (error) {
		next(error);
	}
};

// @desc    Delete Project
// @route   DELETE /api/projects/:projectId
// @access  Private
export const deleteProject: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, 'This user is not allowed to delete projects.');

		const projectId = req.params.projectId;
		const project = await prisma.project.findUnique({
			where: {
				id: projectId,
			},
		});
		if (!project) throw createHttpError(404, 'Project not found.');

		await prisma.project.delete({
			where: {
				id: projectId,
			},
		});

		return res.status(204).send();
	} catch (error) {
		next(error);
	}
};
