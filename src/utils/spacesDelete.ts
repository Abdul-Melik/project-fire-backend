const AWS = require('aws-sdk');
require('aws-sdk/lib/maintenance_mode_message').suppress = true;
import { Request } from 'express';
import { config } from 'dotenv';
config();
// deletes an image from digital ocean spaces
const spacesEndpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');
const s3 = new AWS.S3({
	endpoint: spacesEndpoint,
	accessKeyId: process.env.IMAGE_ACCESS_KEY,
	secretAccessKey: process.env.IMAGE_SECRET,
});
const deleteImage = (key: string) => {
	const params = {
		Bucket: process.env.IMAGE_BUCKET,
		Key: key,
	};
	s3.deleteObject(params, function (err: any, data: any) {
		if (err) console.log(err, err.stack);
		else console.log(data);
	});
};
export default deleteImage;
