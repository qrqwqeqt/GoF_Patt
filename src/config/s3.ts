import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

export const uploadToS3 = (file: Express.Multer.File) => {
  const compressedFileName = file.originalname.trim().split(' ').join('');
  const params: AWS.S3.Types.PutObjectRequest = {
    Bucket: 'eco-rent-images',
    Key: `${uuidv4()}-${compressedFileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  return s3.upload(params).promise();
};

export const deleteFromS3 = (imageUrl: string) => {
  const params: AWS.S3.Types.DeleteObjectRequest = {
    Bucket: 'eco-rent-images',
    Key: imageUrl.split('/').pop() as string,
  };

  return s3.deleteObject(params).promise();
};
