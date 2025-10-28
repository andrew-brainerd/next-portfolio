import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';
  const prefix = process.env.AWS_S3_IMAGE_PREFIX || '';

  if (!bucketName) {
    return NextResponse.json({ error: 'S3 bucket not configured' }, { status: 500 });
  }

  try {
    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
      }
    });

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix
    });

    const response = await s3Client.send(command);

    // Filter for image files
    const imageObjects =
      response.Contents?.filter(obj => {
        const key = obj.Key || '';
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(key);
      }) || [];

    // Generate pre-signed URLs for each image (valid for 1 hour)
    const imageUrls = await Promise.all(
      imageObjects.map(async obj => {
        const getObjectCommand = new GetObjectCommand({
          Bucket: bucketName,
          Key: obj.Key
        });

        const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
          expiresIn: 3600 // 1 hour
        });

        return signedUrl;
      })
    );

    return NextResponse.json({ images: imageUrls });
  } catch (error) {
    console.error('Error fetching S3 images:', error);
    return NextResponse.json({ error: 'Failed to fetch images from S3' }, { status: 500 });
  }
}
