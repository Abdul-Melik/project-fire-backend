const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
const multer = require('multer');
const multerS3 = require('multer-s3');
import { Request } from 'express';
import { config } from 'dotenv';
config();

const imageAccessKey = process.env.IMAGE_ACCESS_KEY;
const imageSecretKey = process.env.IMAGE_SECRET;
const imageBucketName = process.env.IMAGE_BUCKET;

const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
	endpoint: spacesEndpoint,
	accessKeyId: imageAccessKey,
	secretAccessKey: imageSecretKey,
});

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: imageBucketName,
		acl: 'public-read',
		key: function (req: Request, file: any, cb: any) {
			cb(null, Date.now().toString());
		},
	}),
});

export default upload;
