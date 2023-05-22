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

interface DeleteUserReq {
	userId: string;
}

export {
	GetUsersRes,
	GetUserByIdParams,
	GetUserByIdRes,
	GetUserByEmployeeIdParams,
	GetUserByEmployeeIdRes,
	RegisterUserRes,
	RegisterUserReq,
	LoginUserRes,
	LoginUserReq,
	sendResetPasswordEmailReq,
	resetPasswordParams,
	resetPasswordReq,
	DeleteUserParams,
	DeleteUserReq,
};
