import { Request } from 'express';
import upload from '../utils/spacesUpload';

const imageUploadMiddleware = (req: Request, res: any, next: any) => {
	upload.single('image')(req, res, (err: any) => {
		if (err) {
			console.log(err);
			return res.status(500).json({ error: 'Failed to upload image.' });
		}
		next();
	});
};

export default imageUploadMiddleware;
