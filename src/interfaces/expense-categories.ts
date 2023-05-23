import { Types } from 'mongoose';

interface GetExpenseCategoriesRes {
	id: Types.ObjectId;
	name: string;
	description: string;
}

interface GetExpenseCategoriesReq {
	userId: string;
}

interface GetExpenseCategoryByIdParams {
	expenseCategoryId: string;
}

interface GetExpenseCategoryByIdRes {
	id: Types.ObjectId;
	name: string;
	description: string;
}

interface GetExpenseCategoryByIdReq {
	userId: string;
}

interface CreateExpenseCategoryRes {
	id: Types.ObjectId;
	name: string;
	description: string;
}

interface CreateExpenseCategoryReq {
	userId: string;
	name?: string;
	description?: string;
}

interface DeleteExpenseCategoryParams {
	expenseCategoryId: string;
}

interface DeleteExpenseCategoryRes {
	message: string;
}

interface DeleteExpenseCategoryReq {
	userId: string;
}

export {
	GetExpenseCategoriesRes,
	GetExpenseCategoriesReq,
	GetExpenseCategoryByIdParams,
	GetExpenseCategoryByIdRes,
	GetExpenseCategoryByIdReq,
	CreateExpenseCategoryRes,
	CreateExpenseCategoryReq,
	DeleteExpenseCategoryParams,
	DeleteExpenseCategoryRes,
	DeleteExpenseCategoryReq,
};
