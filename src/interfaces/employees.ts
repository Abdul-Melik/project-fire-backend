import { Types } from 'mongoose';

interface GetEmployeesRes {
	id: Types.ObjectId;
	firstName: string;
	lastName: string;
	department: string;
	salary: number;
	techStack: string[];
}

interface GetEmployeeByIdParams {
	employeeId: string;
}

interface GetEmployeeByIdRes {
	id: Types.ObjectId;
	firstName: string;
	lastName: string;
	department: string;
	salary: number;
	techStack: string[];
}

interface AddEmployeeReq {
	userId: string;
	firstName?: string;
	lastName?: string;
	department?: string;
	salary?: number;
	techStack?: string[];
}

interface AddEmployeeRes {
	id: Types.ObjectId;
	firstName: string;
	lastName: string;
	department: string;
	salary: number;
	techStack: string[];
}

interface RemoveEmployeeParams {
	employeeId: string;
}

interface RemoveEmployeeReq {
	userId: string;
}

export {
	GetEmployeesRes,
	GetEmployeeByIdParams,
	GetEmployeeByIdRes,
	AddEmployeeReq,
	AddEmployeeRes,
	RemoveEmployeeParams,
	RemoveEmployeeReq,
};
