import { Response } from 'express';
import jwt from 'jsonwebtoken';

import env from './validate-env';

const createCookie = (res: Response, userId: string, expiresIn: number) => {
	const token = jwt.sign({ userId }, env.JWT_SECRET, { expiresIn });
	res.cookie('jwt', token, {
		httpOnly: true,
		secure: env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: expiresIn,
	});
};

export default createCookie;
