import { RequestHandler } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';

import { exclude } from '../utils/excludeUserFields';

const prisma = new PrismaClient();

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
