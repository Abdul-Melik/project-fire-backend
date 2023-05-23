import { Types } from 'mongoose';
import { UserRole } from '../models/user';

interface GetUsersRes {
	id: Types.ObjectId;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	image?: string;
	employee: Types.ObjectId;
}

interface GetUsersReq {
	userId: string;
}

interface GetUserByIdParams {
	userId: string;
}

interface GetUserByIdRes {
	id: Types.ObjectId;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	image?: string;
	employee: Types.ObjectId;
}

interface GetUserByIdReq {
	userId: string;
}

interface GetUserByEmployeeIdParams {
	employeeId: string;
}

interface GetUserByEmployeeIdRes {
	id: Types.ObjectId;
	email: string;
	firstName: string;
	lastName: string;
	role: UserRole;
	image?: string;
	employee: Types.ObjectId;
}

interface GetUserByEmployeeIdReq {
	userId: string;
}

interface RegisterUserRes {
	user: {
		id: Types.ObjectId;
		email: string;
		firstName: string;
		lastName: string;
		role: UserRole;
		image?: string;
		employee: Types.ObjectId;
	};
	token: string;
	expiresIn: number;
}

interface RegisterUserReq {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
	role?: UserRole;
	department?: string;
	salary?: number;
	techStack?: string[];
}

interface LoginUserRes {
	user: {
		id: Types.ObjectId;
		email: string;
		firstName: string;
		lastName: string;
		role: UserRole;
		image?: string;
		employee: Types.ObjectId;
	};
	token: string;
	expiresIn: number;
}

interface LoginUserReq {
	email?: string;
	password?: string;
	rememberMe?: boolean;
}

interface sendResetPasswordEmailReq {
	email?: string;
}

interface resetPasswordParams {
	userId?: string;
	token?: string;
}

interface resetPasswordReq {
	password?: string;
}

interface DeleteUserParams {
	userId: string;
}

interface DeleteUserRes {
	message: string;
}

interface DeleteUserReq {
	userId: string;
}

export {
	GetUsersRes,
	GetUsersReq,
	GetUserByIdParams,
	GetUserByIdRes,
	GetUserByIdReq,
	GetUserByEmployeeIdParams,
	GetUserByEmployeeIdRes,
	GetUserByEmployeeIdReq,
	RegisterUserRes,
	RegisterUserReq,
	LoginUserRes,
	LoginUserReq,
	sendResetPasswordEmailReq,
	resetPasswordParams,
	resetPasswordReq,
	DeleteUserParams,
	DeleteUserRes,
	DeleteUserReq,
};
