import { RequestHandler } from "express";
import { PrismaClient, Role, ProjectType, SalesChannel, ProjectStatus, Currency } from "@prisma/client";
import createHttpError from "http-errors";

import { getEmployeeSalaryInBAM } from "../helpers";

const prisma = new PrismaClient();

// @desc    Get Projects
// @route   GET /api/projects
// @access  Private
export const getProjects: RequestHandler = async (req, res, next) => {
  try {
    const {
      name = "",
      startDate,
      endDate,
      projectType,
      salesChannel,
      projectStatus,
      orderByField,
      orderDirection,
      take,
      page,
    } = req.query;

    const skip = page && take ? (Number(page) - 1) * Number(take) : 0;

    let orderBy;
    if (orderByField && orderDirection) {
      if (orderByField === "employeesCount")
        orderBy = {
          employees: {
            _count: orderDirection,
          },
        } as any;
      else
        orderBy = {
          [orderByField as string]: orderDirection,
        };
    }

    const where = {
      name: {
        contains: name && name.toString(),
        mode: "insensitive" as const,
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
    };

    const count = await prisma.project.count({ where });

    const projects = await prisma.project.findMany({
      where,
      orderBy,
      skip: skip < count ? skip : undefined,
      take: take ? Number(take) : undefined,
      include: {
        employees: {
          select: {
            partTime: true,
            employee: true,
          },
        },
      },
    });

    const total = projects.length > 0 ? count : 0;
    const lastPage = take ? Math.ceil(total / Number(take)) : total > 0 ? 1 : 0;
    const currentPage = page ? (Number(page) > lastPage ? 1 : Number(page)) : total > 0 ? 1 : 0;
    const perPage = take ? Number(take) : total;

    return res.status(200).json({
      pageInfo: {
        total,
        currentPage,
        lastPage,
        perPage,
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
    if (!project) throw createHttpError(404, "Project not found.");

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

    const yearStartDate = new Date(`${year}-01-01`);
    const yearEndDate = new Date(`${year}-12-31`);

    const yearFilter = {
      AND: [
        {
          OR: [
            {
              startDate: {
                lt: yearStartDate,
              },
            },
            {
              AND: [
                {
                  startDate: {
                    gte: yearStartDate,
                  },
                },
                {
                  startDate: {
                    lte: yearEndDate,
                  },
                },
              ],
            },
          ],
        },
        {
          OR: [
            {
              endDate: {
                gt: yearEndDate,
              },
            },
            {
              AND: [
                {
                  endDate: {
                    gte: yearStartDate,
                  },
                },
                {
                  endDate: {
                    lte: yearEndDate,
                  },
                },
              ],
            },
          ],
        },
      ],
    };

    const totalProjects = await prisma.project.count({
      where: yearFilter,
    });

    type Project = {
      name: string;
      startDate: Date;
      endDate: Date;
      actualEndDate: Date | null;
      hourlyRate: number;
      projectVelocity: number;
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
    let averageVelocity = 0;
    let averageTeamSize = 0;
    let weeksOverDeadline = 0;
    let actualRevenue = 0;
    let plannedRevenue = 0;
    let actualMargin = 0;
    let actualAvgMargin = 0;
    let revenueGap = 0;
    let plannedCost = 0;
    let salesChannelPercentage = {};
    let projectTypeCount = {};
    let projects: Project[] = [];

    if (totalProjects) {
      const projectsData = await prisma.project.findMany({
        where: yearFilter,
        select: {
          name: true,
          startDate: true,
          endDate: true,
          actualEndDate: true,
          hourlyRate: true,
          projectValueBAM: true,
          projectVelocity: true,
          _count: true,
          employees: {
            select: {
              partTime: true,
              employee: {
                select: {
                  salary: true,
                  currency: true,
                },
              },
            },
          },
        },
      });

      projects = projectsData.map(
        ({
          name,
          startDate,
          endDate,
          actualEndDate,
          hourlyRate,
          projectValueBAM,
          projectVelocity,
          _count,
          employees,
        }) => {
          const revenue = projectValueBAM;
          const cost = employees.reduce((sum, { partTime, employee }) => {
            const salary = employee.salary ?? 0;
            const currency = employee.currency ?? Currency.BAM;
            return sum + getEmployeeSalaryInBAM(salary, currency) * (partTime ? 0.5 : 1);
          }, 0);
          const profit = revenue - cost;
          return {
            name,
            startDate,
            endDate,
            actualEndDate,
            hourlyRate,
            projectVelocity,
            numberOfEmployees: _count.employees,
            revenue,
            cost,
            profit,
          };
        }
      );

      totalValue = projects.reduce((sum, { revenue }) => sum + revenue, 0);

      totalCost = projects.reduce((sum, { cost }) => sum + cost, 0);

      actualRevenue = projects.reduce((sum, { cost }) => sum + cost + 4200, 0);

      plannedRevenue = projects.reduce((sum, { cost }) => sum + cost, 0);

      plannedCost = projects.reduce((sum, { cost }) => sum + cost, 0);

      actualMargin = ((actualRevenue - plannedCost) / plannedCost) * 100;

      actualAvgMargin = (actualRevenue - plannedCost) / totalProjects;

      const totalHourlyRate = projects.reduce((sum, { hourlyRate }) => sum + hourlyRate, 0);

      const totalProjectVelocity = projects.reduce((sum, { projectVelocity }) => sum + projectVelocity, 0);

      const totalEmployees = projects.reduce((sum, { numberOfEmployees }) => sum + numberOfEmployees, 0);

      grossProfit = actualRevenue - plannedCost;

      averageValue = totalValue / totalProjects;

      averageRate = totalHourlyRate / totalProjects;

      averageVelocity = totalProjectVelocity / totalProjects;

      averageTeamSize = totalEmployees / totalProjects;

      revenueGap = plannedRevenue - actualRevenue;

      weeksOverDeadline = projects.reduce((sum, { endDate, actualEndDate }) => {
        if (actualEndDate && actualEndDate >= endDate) {
          const diff = actualEndDate.getTime() - endDate.getTime();
          const days = diff / (1000 * 3600 * 24);
          const weeks = days / 7;
          return sum + weeks;
        }
        return sum;
      }, 0);

      const salesChannelCountData = await prisma.project.groupBy({
        where: yearFilter,
        by: ["salesChannel"],
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
        by: ["projectType"],
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
      revenueGap,
      averageRate,
      averageVelocity,
      averageTeamSize,
      weeksOverDeadline,
      plannedRevenue,
      actualRevenue,
      actualMargin,
      actualAvgMargin,
      plannedCost,
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
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to create projects.");

    const {
      name,
      description,
      startDate,
      endDate,
      projectType,
      hourlyRate,
      projectValueBAM,
      projectVelocity,
      salesChannel,
      projectStatus,
      employees = [],
    } = req.body;

    const existingProject = await prisma.project.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });
    if (existingProject) throw createHttpError(409, "Project already exists.");

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        actualEndDate: projectStatus === ProjectStatus.Completed ? new Date(endDate) : undefined,
        projectType,
        hourlyRate,
        projectValueBAM,
        projectVelocity,
        salesChannel,
        projectStatus,
        employees: {
          create: employees.map(({ partTime, employeeId }: { partTime: boolean; employeeId: string }) => ({
            partTime,
            employee: {
              connect: {
                id: employeeId,
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
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to update projects.");

    const projectId = req.params.projectId;
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) throw createHttpError(404, "Project not found.");

    const {
      name,
      description,
      startDate,
      endDate,
      actualEndDate,
      projectType,
      hourlyRate,
      projectValueBAM,
      projectVelocity,
      salesChannel,
      projectStatus,
      employees,
    } = req.body;

    if (name) {
      const existingProject = await prisma.project.findFirst({
        where: {
          name: {
            equals: name,
            mode: "insensitive",
          },
        },
      });
      if (existingProject && existingProject.id !== projectId) throw createHttpError(409, "Project already exists.");
    }

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        actualEndDate: actualEndDate ? new Date(actualEndDate) : actualEndDate === null ? null : undefined,
        projectType,
        hourlyRate,
        projectVelocity,
        projectValueBAM,
        salesChannel,
        projectStatus,
        employees: employees
          ? {
              deleteMany: {},
              create: employees.map(({ partTime, employeeId }: { partTime: boolean; employeeId: string }) => ({
                partTime,
                employee: {
                  connect: {
                    id: employeeId,
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
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to delete projects.");

    const projectId = req.params.projectId;
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
    if (!project) throw createHttpError(404, "Project not found.");

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
