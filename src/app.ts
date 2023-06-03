import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import createHttpError, { isHttpError } from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import cors from 'cors';

import swaggerDocs from './utils/swagger';
import usersRoutes from './routes/users';
import employeesRoutes from './routes/employees';
import projectsRoutes from './routes/projects';
import expenseCategoriesRoutes from './routes/expense-categories';
import expensesRoutes from './routes/expenses';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

app.use('/api/users', usersRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/expense-categories', expenseCategoriesRoutes);
app.use('/api/expenses', expensesRoutes);

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
