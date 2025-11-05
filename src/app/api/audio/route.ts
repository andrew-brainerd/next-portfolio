import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<Response> {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  const region = process.env.AWS_REGION || 'us-east-1';
  const musicFileName = 'audio/something.aac';

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

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: musicFileName
    });

    // Generate pre-signed URL (valid for 1 hour)
    const signedUrl = await getSignedUrl(s3Client, getObjectCommand, {
      expiresIn: 3600
    });

    return NextResponse.json({ url: signedUrl });
  } catch (error) {
    console.error('Error fetching S3 music file:', error);
    return NextResponse.json({ error: 'Failed to fetch music file from S3' }, { status: 500 });
  }
}
