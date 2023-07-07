import AWS from 'aws-sdk';
const multerS3 = require('multer-s3');
import { Request } from 'express';
import { config } from 'dotenv';
import createHttpError from 'http-errors';
import multer from 'multer';
config();

//this is to suppress the warning message from aws-sdk
require('aws-sdk/lib/maintenance_mode_message').suppress = true;

const imageAccessKey = process.env.IMAGE_ACCESS_KEY;
const imageSecretKey = process.env.IMAGE_SECRET;
const imageBucketName = process.env.IMAGE_BUCKET;

const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
	endpoint: spacesEndpoint,
	accessKeyId: imageAccessKey,
	secretAccessKey: imageSecretKey,
});

const fileFilter = (req: Request, file: Express.Multer.File, callback: multer.FileFilterCallback) => {
	if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
		callback(null, true);
	} else {
		callback(createHttpError(400, 'Invalid file type. Only JPEG and PNG files are allowed.'));
	}
};

// Limit is 5MB
const limits = {
	fileSize: 1024 * 1024 * 5,
};

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: imageBucketName,
		acl: 'public-read',
		key: function (req: Request, file: any, cb: any) {
			cb(null, Date.now().toString() + file.originalname);
		},
	}),
	fileFilter,
	limits,
});

export default upload;
