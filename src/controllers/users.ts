import { RequestHandler } from 'express';
import mongoose from 'mongoose';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { UserModel, UserRole } from '../models/user';

interface RegisterUserBody {
	email?: string;
	password?: string;
	name?: string;
	role?: UserRole;
}

interface LoginUserBody {
	email?: string;
	password?: string;
}

export const registerUser: RequestHandler<unknown, unknown, RegisterUserBody, unknown> = async (req, res, next) => {
	const { email, password, name, role } = req.body;
	try {
		if (!email || !password || !name || !role) throw createHttpError(400, 'Missing required fields.');
		const existingUser = await UserModel.findOne({ email });
		if (existingUser) throw createHttpError(409, 'Email already registered.');
		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		const newUser = await UserModel.create({ email, password: hashedPassword, name, role });
		return res.status(201).json(newUser);
	} catch (error) {
		next(error);
	}
};

export const loginUser: RequestHandler<unknown, unknown, LoginUserBody, unknown> = async (req, res, next) => {
	const { email, password } = req.body;
	try {
		if (!email || !password) throw createHttpError(400, 'Missing required fields.');
		const user = await UserModel.findOne({ email });
		if (!user) throw createHttpError(401, 'Invalid email or password.');
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw createHttpError(401, 'Invalid email or password.');
		return res.status(200).json({ message: 'Login successful.' });
	} catch (error) {
		next(error);
	}
};
