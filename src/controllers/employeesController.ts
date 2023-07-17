import { RequestHandler } from "express";
import { PrismaClient, Role, Currency, Department, TechStack } from "@prisma/client";
import createHttpError from "http-errors";

import deleteImage from "../utils/spacesDelete";
import { months } from "../data/intex";

const prisma = new PrismaClient();

// @desc    Get Employees
// @route   GET /api/employees
// @access  Private
export const getEmployees: RequestHandler = async (req, res, next) => {
  try {
    const {
      searchTerm = "",
      currency,
      department,
      techStack,
      isEmployed,
      isStandardDateFilter,
      hiringDate,
      terminationDate,
      orderByField,
      orderDirection,
      take,
      page,
    } = req.query;

    const skip = page && take ? (Number(page) - 1) * Number(take) : 0;

    let orderBy;
    if (orderByField && orderDirection)
      orderBy = {
        [orderByField as string]: orderDirection,
      };

    const where = {
      OR: [
        {
          AND: [
            {
              firstName: {
                contains: searchTerm && searchTerm.toString().split(" ")[0],
                mode: "insensitive" as const,
              },
            },
            {
              lastName: {
                contains: searchTerm && searchTerm.toString().split(" ")[1],
                mode: "insensitive" as const,
              },
            },
          ],
        },
        {
          firstName: {
            contains: searchTerm && searchTerm.toString(),
            mode: "insensitive" as const,
          },
        },
        {
          lastName: {
            contains: searchTerm && searchTerm.toString(),
            mode: "insensitive" as const,
          },
        },
      ],
      currency: currency ? (currency as Currency) : undefined,
      department: department ? (department as Department) : undefined,
      techStack: techStack ? (techStack as TechStack) : undefined,
      isEmployed: isEmployed ? JSON.parse(isEmployed as string) : undefined,
      ...(hiringDate && {
        hiringDate:
          isStandardDateFilter === "" || isStandardDateFilter === "true"
            ? {
                gte: new Date(hiringDate as string),
              }
            : { lt: new Date(hiringDate as string) },
      }),
      ...(terminationDate &&
        (isStandardDateFilter === "" || isStandardDateFilter === "true"
          ? {
              terminationDate: {
                lte: new Date(terminationDate as string),
              },
            }
          : {
              OR: [
                {
                  isEmployed: true,
                },
                {
                  terminationDate: {
                    gt: new Date(terminationDate as string),
                  },
                },
              ],
            })),
    };

    const count = await prisma.employee.count({ where });

    const employees = await prisma.employee.findMany({
      where,
      orderBy,
      skip: skip < count ? skip : undefined,
      take: take ? Number(take) : undefined,
      include: {
        projects: {
          select: {
            partTime: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const total = employees.length > 0 ? count : 0;
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
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employee By Id
// @route   GET /api/employees/:employeeId
// @access  Private
export const getEmployeeById: RequestHandler = async (req, res, next) => {
  try {
    const employeeId = req.params.employeeId;
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
      include: {
        projects: {
          select: {
            partTime: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    if (!employee) throw createHttpError(404, "Employee not found.");

    return res.status(200).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Employees Info
// @route   GET /api/employees/info
// @access  Private
export const getEmployeesInfo: RequestHandler = async (req, res, next) => {
  try {
    const { year } = req.query;

    const employees = await prisma.employee.findMany({
      include: {
        projects: {
          select: {
            partTime: true,
            project: {
              select: {
                id: true,
                name: true,
                startDate: true,
                endDate: true,
              },
            },
          },
        },
      },
    });

    type EmployeesInfo = {
      month: string;
      totalHoursAvailable: number;
      totalHoursBilled: number;
      developmentCost: number;
      designCost: number;
      otherCost: number;
      totalCost: number;
    };

    const employeesInfo: EmployeesInfo[] = [];

    months.forEach((month, index) => {
      const startDateMonth = new Date(Number(year), index);
      const endDateMonth = new Date(Number(year), index + 1);

      const formattedMonth = month + ": " + startDateMonth.toLocaleDateString();

      let totalDaysAvailable = 0;
      let totalDaysBilled = 0;
      let developmentCost = 0;
      let designCost = 0;
      let otherCost = 0;
      let totalCost = 0;

      employees.forEach(({ hiringDate, terminationDate, projects }) => {
        const startDate =
          hiringDate < endDateMonth && (!terminationDate || startDateMonth < terminationDate)
            ? hiringDate < startDateMonth
              ? startDateMonth
              : hiringDate
            : null;

        const endDate =
          hiringDate < endDateMonth && (!terminationDate || startDateMonth < terminationDate)
            ? !terminationDate || endDateMonth < terminationDate
              ? endDateMonth
              : terminationDate
            : null;

        if (startDate && endDate) {
          let currentDate = startDate;

          while (currentDate < endDate) {
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
              totalDaysAvailable++;

              let fullTimeProjectsFound = 0;
              let partTimeProjectsFound = 0;

              const foundProjects = projects.filter(({ project }) => {
                const startDate = project.startDate;
                const endDate = project.endDate;
                return startDate <= currentDate && currentDate <= endDate;
              });

              if (foundProjects.length > 0) {
                foundProjects.forEach(({ partTime }) => {
                  if (!partTime) {
                    fullTimeProjectsFound++;
                    if (fullTimeProjectsFound === 1) {
                      return;
                    }
                  } else {
                    partTimeProjectsFound++;
                    if (partTimeProjectsFound === 2) {
                      return;
                    }
                  }
                });
              }

              if (fullTimeProjectsFound === 1 || partTimeProjectsFound === 2) totalDaysBilled++;
              else if (partTimeProjectsFound === 1) totalDaysBilled += 0.5;
            }

            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      });

      developmentCost = employees
        .filter((employee) => employee.department === Department.Development && employee.projects.length > 0)
        .reduce(
          (sum, employee) =>
            sum + (employee.projects.some((proj) => proj.partTime) ? employee.salary / 2 : employee.salary),
          0
        );

      designCost = employees
        .filter((employee) => employee.department === Department.Design && employee.projects.length > 0)
        .reduce(
          (sum, employee) =>
            sum + (employee.projects.some((proj) => proj.partTime) ? employee.salary / 2 : employee.salary),
          0
        );

      otherCost = employees
        .filter(
          (employee) =>
            (employee.department === Department.Administration || employee.department === Department.Management) &&
            employee.projects.length > 0
        )
        .reduce(
          (sum, employee) =>
            sum + (employee.projects.some((proj) => proj.partTime) ? employee.salary / 2 : employee.salary),
          0
        );

      totalCost = otherCost + designCost + developmentCost;

      employeesInfo.push({
        month: formattedMonth,
        totalHoursAvailable: totalDaysAvailable * 8,
        totalHoursBilled: totalDaysBilled * 8,
        developmentCost,
        designCost,
        otherCost,
        totalCost,
      });
    });

    return res.status(200).json(employeesInfo);
  } catch (error) {
    next(error);
  }
};
// @desc    Create Employee
// @route   POST /api/employees
// @access  Private
export const createEmployee: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to create employees.");

    const { firstName, lastName, department, salary, currency, techStack } = req.body;

    let imageData: string | undefined;
    if (req.file) {
      const file = req.file as unknown as { location: string };
      imageData = file.location;
    }

    const hiringDate = new Date();
    hiringDate.setHours(0, 0, 0, 0);

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        image: imageData,
        department,
        salary: Number(salary),
        currency,
        techStack,
        hiringDate,
      },
    });

    return res.status(201).json(employee);
  } catch (error) {
    next(error);
  }
};

// @desc    Update Employee
// @route   PATCH /api/employees/:employeeId
// @access  Private
export const updateEmployee: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to update employees.");

    const employeeId = req.params.employeeId;
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });
    if (!employee) throw createHttpError(404, "Employee not found.");

    const { firstName, lastName, department, salary, currency, techStack, isEmployed } = req.body;

    let imageData = employee.image;
    if (req.file) {
      if (imageData) {
        const key = imageData.split("/").slice(-1)[0];
        deleteImage(key);
      }
      const file = req.file as unknown as { location: string };
      imageData = file.location;
    }

    let terminationDate;
    if (isEmployed === "false" && isEmployed !== employee.isEmployed.toString()) {
      terminationDate = new Date();
      terminationDate!.setHours(0, 0, 0, 0);
    } else if (isEmployed === "true" && isEmployed !== employee.isEmployed.toString())
      throw createHttpError(400, "We have no interest in rehiring former employees.");

    const updatedEmployee = await prisma.employee.update({
      where: {
        id: employeeId,
      },
      data: {
        firstName,
        lastName,
        image: imageData ? imageData : undefined,
        department,
        salary: salary ? Number(salary) : undefined,
        currency,
        techStack,
        isEmployed: isEmployed ? JSON.parse(isEmployed as string) : undefined,
        terminationDate,
      },
    });

    return res.status(200).json(updatedEmployee);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Employee
// @route   DELETE /api/employees/:employeeId
// @access  Private
export const deleteEmployee: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to delete employees.");

    const employeeId = req.params.employeeId;
    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });
    if (!employee) throw createHttpError(404, "Employee not found.");

    if (employee.image) {
      const key = employee.image.split("/").slice(-1)[0];
      deleteImage(key);
    }

    await prisma.employee.delete({
      where: {
        id: employeeId,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
