import { S3, Endpoint } from "aws-sdk";
require("aws-sdk/lib/maintenance_mode_message").suppress = true;
const multerS3 = require("multer-s3");
import multer from "multer";
import { Request } from "express";
import createHttpError from "http-errors";

import env from "./validateEnv";

const imageAccessKey = env.IMAGE_ACCESS_KEY;
const imageSecret = env.IMAGE_SECRET;
const imageBucket = env.IMAGE_BUCKET;

const spacesEndpoint = new Endpoint("fra1.digitaloceanspaces.com");
const s3 = new S3({
  endpoint: spacesEndpoint,
  accessKeyId: imageAccessKey,
  secretAccessKey: imageSecret,
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: multer.FileFilterCallback
) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    callback(null, true);
  } else {
    callback(
      createHttpError(
        400,
        "Invalid file type. Only JPEG and PNG files are allowed."
      )
    );
  }
};

// Limit is 5MB
const limits = {
  fileSize: 1024 * 1024 * 5,
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: imageBucket,
    acl: "public-read",
    key: function (req: Request, file: any, cb: any) {
      cb(null, Date.now().toString() + file.originalname);
    },
  }),
  fileFilter,
  limits,
});

export default upload;
