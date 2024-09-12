import { S3, Endpoint } from "aws-sdk";
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

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

const deleteImage = (key: string) => {
  const params = {
    Bucket: imageBucket,
    Key: key,
  };
  s3.deleteObject(params, (err: any) => {
    if (err) console.log(err, err.stack);
  });
};

export default deleteImage;
