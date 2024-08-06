import { PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';

import { TASK_LIMITATION_PREFIX } from '../constraints';

interface Props {
  bucketName: string;
  objectKey: string;
  body: string | Uint8Array | Buffer;
  client: S3Client;
}

export const uploadFile = async (props: Props): Promise<void> => {
  await props.client.send(
    new PutObjectCommand({
      Bucket: props.bucketName,
      Key: `${TASK_LIMITATION_PREFIX}/${props.objectKey}`,
      Body: props.body,
    }),
  );
};
