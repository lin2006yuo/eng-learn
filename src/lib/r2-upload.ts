import { PutObjectCommand } from '@aws-sdk/client-s3';
import { R2 } from './r2-client';

export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string,
): Promise<string> {
  const key = `uploads/${Date.now()}-${filename}`;

  await R2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}