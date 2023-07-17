import { RequestHandler } from "express";
import { PrismaClient, Role, Month } from "@prisma/client";
import createHttpError from "http-errors";

import { excludeExpenseInfo, getEmployeeSalaryInBAM } from "../helpers";
import { months } from "../data/intex";

const prisma = new PrismaClient();

// @desc    Get Expenses
// @route   GET /api/expenses
// @access  Private
export const getExpenses: RequestHandler = async (req, res, next) => {
  try {
    const expenses = (
      await prisma.expense.findMany({
        include: {
          expenseCategory: true,
        },
      })
    ).map((expense) => excludeExpenseInfo(expense, ["expenseCategoryId"]));

    return res.status(200).json(expenses);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Expense By Id
// @route   GET /api/expenses/:expenseId
// @access  Private
export const getExpenseById: RequestHandler = async (req, res, next) => {
  try {
    const expenseId = req.params.expenseId;
    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      include: {
        expenseCategory: true,
      },
    });
    if (!expense) throw createHttpError(404, "Expense not found.");

    return res.status(200).json(excludeExpenseInfo(expense, ["expenseCategoryId"]));
  } catch (error) {
    next(error);
  }
};

// @desc    Get Expenses Info
// @route   GET /api/expenses/info
// @access  Private
export const getExpensesInfo: RequestHandler = async (req, res, next) => {
  try {
    const { year } = req.query;

    const expenses = await prisma.expense.findMany({
      include: {
        expenseCategory: true,
      },
    });

    type ExpensesPerMonth = {
      year: number;
      month: string;
      marketingActualExpense: number;
      hrActualExpense: number;
      officeActualExpense: number;
      salesActualExpense: number;
      otherActualExpense: number;
      indirectActualExpense: number;
      plannedExpense: number;
      actualExpense: number;
    };

    type ExpensesInfo = {
      monthsWithPlannedExpenses: string[];
      monthsWithActualExpenses: string[];
      totalMarketingActualExpense: number;
      totalHrActualExpense: number;
      totalOfficeActualExpense: number;
      totalSalesActualExpense: number;
      totalOtherActualExpense: number;
      totalIndirectActualExpense: number;
      totalMarketingPlannedExpense: number;
      totalHrPlannedExpense: number;
      totalOfficePlannedExpense: number;
      totalSalesPlannedExpense: number;
      totalOtherPlannedExpense: number;
      totalIndirectPlannedExpense: number;
      totalPlannedExpenses: number;
      totalActualExpenses: number;
      expensesPerMonth: ExpensesPerMonth[];
    };

    const expensesPerMonth: ExpensesPerMonth[] = [];
    const monthsWithPlannedExpenses: string[] = [];
    const monthsWithActualExpenses: string[] = [];
    let totalMarketingActualExpense = 0;
    let totalHrActualExpense = 0;
    let totalOfficeActualExpense = 0;
    let totalSalesActualExpense = 0;
    let totalOtherActualExpense = 0;
    let totalIndirectActualExpense = 0;
    let totalMarketingPlannedExpense = 0;
    let totalHrPlannedExpense = 0;
    let totalOfficePlannedExpense = 0;
    let totalSalesPlannedExpense = 0;
    let totalOtherPlannedExpense = 0;
    let totalIndirectPlannedExpense = 0;

    months.forEach((month, index) => {
      const startDateMonth = new Date(Number(year), index);

      const marketingExpenses = expenses.filter((expense) => expense.expenseCategory.name === "Marketing");
      const hrExpenses = expenses.filter((expense) => expense.expenseCategory.name === "HR costs");
      const officeExpenses = expenses.filter((expense) => expense.expenseCategory.name === "Office cost");
      const salesExpenses = expenses.filter((expense) => expense.expenseCategory.name === "Sales costs");
      const otherExpenses = expenses.filter((expense) => expense.expenseCategory.name === "Other costs");
      const indirectExpenses = expenses.filter((expense) => expense.expenseCategory.name === "Indirect");

      const currentYear = Number(year) || new Date().getFullYear();

      const marketingActualExpense = marketingExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.actualExpense ?? 0);
        }
        return total;
      }, 0);

      const hrActualExpense = hrExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.actualExpense ?? 0);
        }
        return total;
      }, 0);

      const officeActualExpense = officeExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.actualExpense ?? 0);
        }
        return total;
      }, 0);

      const salesActualExpense = salesExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.actualExpense ?? 0);
        }
        return total;
      }, 0);

      const otherActualExpense = otherExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.actualExpense ?? 0);
        }
        return total;
      }, 0);

      const indirectActualExpense = indirectExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.actualExpense ?? 0);
        }
        return total;
      }, 0);

      const marketingPlannedExpense = marketingExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.plannedExpense ?? 0);
        }
        return total;
      }, 0);

      const hrPlannedExpense = hrExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.plannedExpense ?? 0);
        }
        return total;
      }, 0);

      const officePlannedExpense = officeExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.plannedExpense ?? 0);
        }
        return total;
      }, 0);

      const salesPlannedExpense = salesExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.plannedExpense ?? 0);
        }
        return total;
      }, 0);

      const otherPlannedExpense = otherExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.plannedExpense ?? 0);
        }
        return total;
      }, 0);

      const indirectPlannedExpense = indirectExpenses.reduce((total, expense) => {
        if (expense.year === currentYear && expense.month === month) {
          return total + (expense.plannedExpense ?? 0);
        }
        return total;
      }, 0);

      totalMarketingActualExpense += marketingActualExpense;
      totalOtherActualExpense += otherActualExpense;
      totalSalesActualExpense += salesActualExpense;
      totalHrActualExpense += hrActualExpense;
      totalOfficeActualExpense += officeActualExpense;
      totalIndirectActualExpense += indirectActualExpense;

      totalMarketingPlannedExpense += marketingPlannedExpense;
      totalHrPlannedExpense += hrPlannedExpense;
      totalOfficePlannedExpense += officePlannedExpense;
      totalSalesPlannedExpense += salesPlannedExpense;
      totalOtherPlannedExpense += otherPlannedExpense;
      totalIndirectPlannedExpense += indirectPlannedExpense;

      const expensesForMonth = expenses.filter((expense) => expense.month === month && expense.year === currentYear);

      const actualExpense = expensesForMonth.reduce((total, expense) => total + (expense.actualExpense ?? 0), 0);

      const plannedExpense = expensesForMonth.reduce((total, expense) => total + (expense.plannedExpense ?? 0), 0);

      if (actualExpense > 0) monthsWithActualExpenses.push(month);
      if (plannedExpense > 0) monthsWithPlannedExpenses.push(month);

      expensesPerMonth.push({
        year: Number(year),
        month,
        marketingActualExpense,
        hrActualExpense,
        officeActualExpense,
        salesActualExpense,
        otherActualExpense,
        indirectActualExpense,
        plannedExpense,
        actualExpense,
      });
    });

    const totalPlannedExpenses =
      totalMarketingPlannedExpense +
      totalHrPlannedExpense +
      totalOfficePlannedExpense +
      totalSalesPlannedExpense +
      totalOtherPlannedExpense +
      totalIndirectPlannedExpense;

    const totalActualExpenses =
      totalMarketingActualExpense +
      totalHrActualExpense +
      totalOfficeActualExpense +
      totalSalesActualExpense +
      totalOtherActualExpense +
      totalIndirectActualExpense;

    const expensesInfo: ExpensesInfo = {
      monthsWithPlannedExpenses,
      monthsWithActualExpenses,
      totalMarketingActualExpense,
      totalHrActualExpense,
      totalOfficeActualExpense,
      totalSalesActualExpense,
      totalOtherActualExpense,
      totalIndirectActualExpense,
      totalMarketingPlannedExpense,
      totalHrPlannedExpense,
      totalOfficePlannedExpense,
      totalSalesPlannedExpense,
      totalOtherPlannedExpense,
      totalIndirectPlannedExpense,
      totalPlannedExpenses,
      totalActualExpenses,
      expensesPerMonth,
    };

    return res.status(200).json(expensesInfo);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Expense
// @route   POST /api/expenses
// @access  Private
export const createExpense: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to create expenses.");

    const { year, month, plannedExpense, actualExpense, expenseCategory } = req.body;

    const existingExpenseCategory = await prisma.expenseCategory.findFirst({
      where: {
        name: {
          equals: expenseCategory,
          mode: "insensitive",
        },
      },
    });
    if (!existingExpenseCategory) throw createHttpError(404, "Expense category not found.");

    const existingExpense = await prisma.expense.findUnique({
      where: {
        year_month_expenseCategoryId: {
          year,
          month,
          expenseCategoryId: existingExpenseCategory.id,
        },
      },
    });
    if (existingExpense) throw createHttpError(409, "Expense already exists.");

    let calculatedPlannedExpense = 0;

    if (expenseCategory.toLowerCase() === "direct") {
      const projects = await prisma.project.findMany({
        where: {
          startDate: { lte: new Date(year, months.indexOf(month) + 1, 0) },
          endDate: { gte: new Date(year, months.indexOf(month), 1) },
        },
        select: {
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

      calculatedPlannedExpense = projects.reduce((total, { employees }) => {
        const cost = employees.reduce((sum, { partTime, employee }) => {
          const salary = employee.salary ?? 0;
          const currency = employee.currency ?? "BAM";
          return sum + getEmployeeSalaryInBAM(salary, currency) * (partTime ? 0.5 : 1);
        }, 0);
        return total + cost;
      }, 0);
    }

    const finalPlannedExpense = expenseCategory.toLowerCase() === "direct" ? calculatedPlannedExpense : plannedExpense;

    const expense = await prisma.expense.create({
      data: {
        year,
        month,
        plannedExpense: finalPlannedExpense ?? actualExpense,
        actualExpense: actualExpense ?? finalPlannedExpense,
        expenseCategoryId: existingExpenseCategory.id,
      },
      include: {
        expenseCategory: true,
      },
    });

    return res.status(201).json(excludeExpenseInfo(expense, ["expenseCategoryId"]));
  } catch (error) {
    next(error);
  }
};

// @desc    Update Expense
// @route   PATCH /api/expenses/:expenseId
// @access  Private
export const updateExpense: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to update expenses.");

    const expenseId = req.params.expenseId;
    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      include: {
        expenseCategory: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!expense) throw createHttpError(404, "Expense not found.");

    const { year, month, plannedExpense, actualExpense, expenseCategory } = req.body;

    const searchYear = year || expense.year;
    const searchMonth = month || expense.month;
    const searchName = expenseCategory || expense.expenseCategory.name;

    const existingExpenseCategory = await prisma.expenseCategory.findFirst({
      where: {
        name: {
          equals: searchName,
          mode: "insensitive",
        },
      },
    });
    if (!existingExpenseCategory) throw createHttpError(404, "Expense category not found.");

    const existingExpense = await prisma.expense.findUnique({
      where: {
        year_month_expenseCategoryId: {
          year: searchYear,
          month: searchMonth,
          expenseCategoryId: existingExpenseCategory.id,
        },
      },
    });
    if (existingExpense && existingExpense.id !== expenseId) throw createHttpError(409, "Expense already exists.");

    let calculatedPlannedExpense = 0;

    if (searchName.toLowerCase() === "direct") {
      const projects = await prisma.project.findMany({
        where: {
          startDate: {
            lte: new Date(searchYear, months.indexOf(searchMonth) + 1, 0),
          },
          endDate: {
            gte: new Date(searchYear, months.indexOf(searchMonth), 1),
          },
        },
        select: {
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

      calculatedPlannedExpense = projects.reduce((total, { employees }) => {
        const cost = employees.reduce((sum, { partTime, employee }) => {
          const salary = employee.salary ?? 0;
          const currency = employee.currency ?? "BAM";
          return sum + getEmployeeSalaryInBAM(salary, currency) * (partTime ? 0.5 : 1);
        }, 0);
        return total + cost;
      }, 0);
    }

    const finalPlannedExpense = searchName.toLowerCase() === "direct" ? calculatedPlannedExpense : plannedExpense;

    const updatedExpense = await prisma.expense.update({
      where: {
        id: expenseId,
      },
      data: {
        year,
        month,
        plannedExpense: finalPlannedExpense,
        actualExpense,
        expenseCategoryId: existingExpenseCategory.id,
      },
      include: {
        expenseCategory: true,
      },
    });

    return res.status(200).json(excludeExpenseInfo(updatedExpense, ["expenseCategoryId"]));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Expense
// @route   DELETE /api/expenses/:expenseId
// @access  Private
export const deleteExpense: RequestHandler = async (req, res, next) => {
  try {
    const loggedInUser = req.user;
    if (loggedInUser?.role !== Role.Admin) throw createHttpError(403, "This user is not allowed to delete expenses.");

    const expenseId = req.params.expenseId;
    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
    });
    if (!expense) throw createHttpError(404, "Expense not found.");

    await prisma.expense.delete({
      where: {
        id: expenseId,
      },
    });

    return res.sendStatus(204);
  } catch (error) {
    next(error);
  }
};
