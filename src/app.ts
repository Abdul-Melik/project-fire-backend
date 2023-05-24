import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import cors from 'cors';

import UsersRoutes from './routes/users';
import EmployeesRoutes from './routes/employees';
import ProjectsRoutes from './routes/projects';
import ExpenseCategoriesRoutes from './routes/expense-categories';
import ExpensesRoutes from './routes/expenses';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', UsersRoutes);
app.use('/api/employees', EmployeesRoutes);
app.use('/api/projects', ProjectsRoutes);
app.use('/api/expense-categories', ExpenseCategoriesRoutes);
app.use('/api/expenses', ExpensesRoutes);

app.use((req, res, next) => {
	next(createHttpError(404, 'Endpoint not found.'));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
	console.error(error);
	let errorMessage = 'An unknown error occured.';
	let statusCode = 500;
	if (isHttpError(error)) {
		errorMessage = error.message;
		statusCode = error.status;
	}
	res.status(statusCode).json({ error: errorMessage });
});

export default app;
