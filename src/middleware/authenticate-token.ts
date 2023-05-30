import { RequestHandler } from 'express';
import { PrismaClient } from '@prisma/client';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';

import env from '../utils/validate-env';

interface DecodedToken {
	userId: string;
}

const prisma = new PrismaClient();

const authenticateToken: RequestHandler = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1] ?? null;
		if (!token) throw Error();

		const decodedToken = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

		const userId = decodedToken.userId;
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) throw Error();

		req.user = user;

		next();
	} catch (error) {
		next(createHttpError(401, 'Authentication failed.'));
	}
};

export default authenticateToken;
