import { InferSchemaType, Schema, model } from 'mongoose';

const tokenSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	token: {
		type: String,
		required: true,
	},
	expirationTime: {
		type: Date,
		required: true,
	},
});

tokenSchema.index({ expirationTime: 1 }, { expireAfterSeconds: 0 });

type Token = InferSchemaType<typeof tokenSchema>;

const TokenModel = model<Token>('Token', tokenSchema);

export { TokenModel, Token };
