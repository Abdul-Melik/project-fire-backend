import { Response } from 'express';
import jwt from 'jsonwebtoken';

import env from './validateEnv';

const createCookie = (res: Response, userId: string, expiresIn: number) => {
	const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn });
	res.cookie('jwt', token, {
		httpOnly: true,
		secure: env.NODE_ENV === 'production',
		sameSite: 'none',
		maxAge: expiresIn,
	});
};

export default createCookie;
