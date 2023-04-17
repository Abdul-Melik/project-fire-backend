import { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { UserModel, UserRole } from '../models/user';
import jwt from 'jsonwebtoken';
import env from '../utils/validate-env';

interface RegisterUserBody {
	email?: string;
	password?: string;
	name?: string;
	role?: UserRole;
}

export const registerUser: RequestHandler<unknown, unknown, RegisterUserBody, unknown> = async (req, res, next) => {
	const { email, password, name, role } = req.body;

	try {
		if (!email || !password || !name || !role) throw createHttpError(400, 'Missing required fields.');

		const existingUser = await UserModel.findOne({ email });
		if (existingUser) throw createHttpError(409, 'Email already registered.');

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		const user = await UserModel.create({
			email,
			password: hashedPassword,
			name,
			role,
		});

		const expireLength = '1d';
		const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
			expiresIn: expireLength,
		});

		return res.status(201).json({ user: { id: user._id, email, name }, token, expiresIn: expireLength });
	} catch (error) {
		next(error);
	}
};

interface LoginUserBody {
	email?: string;
	password?: string;
	rememberMe?: boolean;
}

export const loginUser: RequestHandler<unknown, unknown, LoginUserBody, unknown> = async (req, res, next) => {
	const { email, password, rememberMe } = req.body;

	try {
		if (!email || !password) throw createHttpError(400, 'Missing required fields.');

		const user = await UserModel.findOne({ email });
		if (!user) throw createHttpError(401, 'Invalid email or password.');

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw createHttpError(401, 'Invalid email or password.');

		const expireLength = rememberMe ? '30d' : '1d';
		const token = jwt.sign({ userId: user._id }, env.JWT_SECRET, {
			expiresIn: expireLength,
		});

		return res.status(200).json({ user: { id: user._id, email, name: user.name }, token, expiresIn: expireLength });
	} catch (error) {
		next(error);
	}
};

interface DeleteUserParams {
	userId: string;
}

export const deleteUser: RequestHandler<DeleteUserParams, unknown, unknown, unknown> = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const user = await UserModel.findById(userId);

		if (!user) throw createHttpError(404, 'User not found.');

		if (user.role === UserRole.Admin) {
			throw createHttpError(403, 'Cannot delete an admin user.');
		}

		await user.deleteOne();

		return res.status(200).json({ message: 'User deleted successfully.' });
	} catch (error) {
		next(error);
	}
};
