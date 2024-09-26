import { InferSchemaType, Schema, model } from 'mongoose';

enum ProjectType {
	Fixed = 'fixed',
	OnGoing = 'on-going',
}

enum SalesChannel {
	Online = 'online',
	InPerson = 'in-person',
	Referral = 'referral',
	Other = 'other',
}

enum ProjectStatus {
	Active = 'active',
	Inactive = 'inactive',
	OnHold = 'on-hold',
	Completed = 'completed',
}

const projectSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	description: {
		type: String,
		required: true,
	},
	startDate: {
		type: Date,
		required: true,
	},
	endDate: {
		type: Date,
		required: true,
	},
	actualEndDate: {
		type: Date,
	},
	projectType: {
		type: String,
		enum: Object.values(ProjectType),
		required: true,
	},
	hourlyRate: {
		type: Number,
		required: true,
	},
	projectValueBAM: {
		type: Number,
		required: true,
	},
	salesChannel: {
		type: String,
		enum: Object.values(SalesChannel),
		required: true,
	},
	projectStatus: {
		type: String,
		enum: Object.values(ProjectStatus),
		default: ProjectStatus.Active,
	},
	finished: {
		type: Boolean,
		default: false,
	},
	employees: [
		{
			employee: {
				type: Schema.Types.ObjectId,
				ref: 'Employee',
				required: true,
			},
			fullTime: {
				type: Boolean,
				required: true,
			},
		},
	],
});

type Project = InferSchemaType<typeof projectSchema>;

const ProjectModel = model<Project>('Project', projectSchema);

export { ProjectModel, Project, ProjectType, SalesChannel, ProjectStatus };
