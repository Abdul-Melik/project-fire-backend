import { RequestHandler } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import createHttpError from 'http-errors';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import path from 'path';
import fs from 'fs';

import env from '../utils/validate-env';
import createCookie from '../utils/create-cookie';

const prisma = new PrismaClient();

const exclude = <User, Key extends keyof User>(user: User, keys: Key[]): Omit<User, Key> => {
	return keys.reduce(
		(result, key) => {
			delete result[key];
			return result;
		},
		{ ...user }
	);
};

// @desc    Get Users
// @route   GET /api/users
// @access  Private
export const getUsers: RequestHandler = async (req, res, next) => {
	try {
		const users = (await prisma.user.findMany()).map(user => exclude(user, ['password']));

		return res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

// @desc    Get User By Id
// @route   GET /api/users/:userId
// @access  Private
export const getUserById: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) throw createHttpError(404, 'User not found.');

		return res.status(200).json(exclude(user, ['password']));
	} catch (error) {
		next(error);
	}
};

// @desc    Register User
// @route   POST /api/users/register
// @access  Public
export const registerUser: RequestHandler = async (req, res, next) => {
	try {
		const { email, firstName, lastName, password, role } = req.body;
		if (!email || !firstName || !lastName || !password) throw createHttpError(400, 'Missing required fields.');

		const existingUser = await prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (existingUser) throw createHttpError(409, 'User already exists.');

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);

		let imageData: string | undefined;
		if (req.file) {
			imageData = 'https://www.dmarge.com/wp-content/uploads/2021/01/dwayne-the-rock-.jpg';
		}

		const user = await prisma.user.create({
			data: {
				email,
				firstName,
				lastName,
				password: hashedPassword,
				image: imageData,
				role,
			},
		});

		// 1d in milliseconds
		const expiresIn = 1000 * 60 * 60 * 24;
		createCookie(res, user.id, expiresIn);

		return res.status(201).json(exclude(user, ['password']));
	} catch (error) {
		next(error);
	}
};

// @desc    Login User
// @route   POST /api/users/login
// @access  Public
export const loginUser: RequestHandler = async (req, res, next) => {
	try {
		const { email, password, rememberMe } = req.body;
		if (!email || !password) throw createHttpError(400, 'Missing required fields.');

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (!user) throw createHttpError(401, 'Invalid email or password.');

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) throw createHttpError(401, 'Invalid email or password.');

		// Either 7d in milliseconds, or 1d in milliseconds
		const expiresIn = rememberMe ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24;
		createCookie(res, user.id, expiresIn);

		return res.status(200).json(exclude(user, ['password']));
	} catch (error) {
		next(error);
	}
};

// @desc    Logout User
// @route   POST /api/users/logout
// @access  Public
export const logoutUser: RequestHandler = async (req, res, next) => {
	try {
		res.cookie('jwt', '', {
			httpOnly: true,
			expires: new Date(Date.now()),
		});

		res.status(200).json({ message: 'User logged out successfully.' });
	} catch (error) {
		next(error);
	}
};

// @desc    Send Reset Password Email
// @route   POST /api/users/reset-password
// @access  Public
export const sendResetPasswordEmail: RequestHandler = async (req, res, next) => {
	try {
		const { email } = req.body;
		if (!email) throw createHttpError(400, 'Email not provided.');

		const user = await prisma.user.findUnique({
			where: {
				email,
			},
		});
		if (!user) throw createHttpError(404, 'User not found.');

		// 1h in milliseconds
		const expiresIn = 1 * 60 * 60 * 1000;

		const tokenObj = await prisma.token.create({
			data: {
				token: jwt.sign({ userId: user.id }, env.JWT_SECRET, {
					expiresIn,
				}),
				expiration: new Date(Date.now() + expiresIn),
				userId: user.id,
			},
		});

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: env.EMAIL_ADDRESS,
				pass: env.EMAIL_PASSWORD,
			},
		});

		const template = handlebars.compile(
			fs.readFileSync(path.join(__dirname, '..', 'views', 'reset-password.hbs'), 'utf8')
		);

		const htmlToSend = template({
			resetLink: `${env.CLIENT_URL}/${tokenObj.userId}/reset-password/${tokenObj.token}/`,
		});

		const mailOptions = {
			from: env.EMAIL_ADDRESS,
			to: email,
			subject: 'Password Reset Request',
			html: htmlToSend,
		};

		transporter.sendMail(mailOptions);

		res.status(200).json({ message: 'An email has been sent to reset your password.' });
	} catch (error) {
		next(error);
	}
};

// @desc    Reset Password
// @route   POST /api/users/:userId/reset-password/:token
// @access  Public
export const resetPassword: RequestHandler = async (req, res, next) => {
	try {
		const userId = req.params.userId;
		const token = req.params.token;

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) throw createHttpError(400, 'Link is invalid or has expired.');

		const tokenObj = await prisma.token.findUnique({
			where: {
				token_userId: { token, userId },
			},
		});
		if (!tokenObj) throw createHttpError(400, 'Link is invalid or has expired.');

		const currentDate = new Date();
		const expirationDate = tokenObj.expiration;

		if (currentDate > expirationDate) throw createHttpError(400, 'Link is invalid or has expired.');

		const { password } = req.body;
		if (!password) throw createHttpError(400, 'Password not provided.');

		const saltRounds = 10;
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				password: hashedPassword,
			},
		});

		await prisma.token.deleteMany({
			where: {
				userId,
			},
		});

		res.status(200).json({ message: 'Your password has been reset successfully.' });
	} catch (error) {
		next(error);
	}
};

// @desc    Update User
// @route   PATCH /api/users/:userId
// @access  Private
export const updateUser: RequestHandler = async (req, res, next) => {
	try {
		let loggedInUser = req.user;
		const userId = req.params.userId;
		if (loggedInUser?.role !== Role.Admin && loggedInUser?.id !== userId)
			throw createHttpError(403, 'This user is not allowed to update other users.');

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) throw createHttpError(404, 'User not found.');
		if (user.role === Role.Admin && user.id !== loggedInUser?.id)
			throw createHttpError(403, 'Cannot update an admin user.');

		const { email, firstName, lastName, password, role } = req.body;

		if (email) {
			const existingUser = await prisma.user.findUnique({
				where: {
					email,
				},
			});
			if (existingUser) throw createHttpError(409, 'User already exists.');
		}

		const saltRounds = 10;
		let hashedPassword;
		if (password) hashedPassword = await bcrypt.hash(password, saltRounds);

		let imageData: string | undefined;
		if (req.file) {
			imageData = 'https://www.dmarge.com/wp-content/uploads/2021/01/dwayne-the-rock-.jpg';
		}

		const updatedUser = await prisma.user.update({
			where: {
				id: userId,
			},
			data: {
				email,
				firstName,
				lastName,
				password: hashedPassword,
				image: imageData,
				role: loggedInUser?.role === Role.Admin ? role : undefined,
			},
		});

		return res.status(200).json(exclude(updatedUser, ['password']));
	} catch (error) {
		next(error);
	}
};

// @desc    Delete User
// @route   DELETE /api/users/:userId
// @access  Private
export const deleteUser: RequestHandler = async (req, res, next) => {
	try {
		const loggedInUser = req.user;
		const userId = req.params.userId;
		if (loggedInUser?.role !== Role.Admin && loggedInUser?.id !== userId)
			throw createHttpError(403, 'This user is not allowed to delete other users.');

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});
		if (!user) throw createHttpError(404, 'User not found.');
		if (user.role === Role.Admin && user.id !== loggedInUser?.id)
			throw createHttpError(403, 'Cannot delete an admin user.');

		await prisma.user.delete({
			where: {
				id: userId,
			},
		});

		return res.status(204).send();
	} catch (error) {
		next(error);
	}
};
