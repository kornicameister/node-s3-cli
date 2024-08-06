import { DeleteObjectsCommand, type S3Client } from '@aws-sdk/client-s3';

import { TASK_LIMITATION_PREFIX } from '../constraints';

import { listBucket } from './listBucket';

interface Props {
  bucketName: string;
  filter: RegExp;
  client: S3Client;
}

export const deleteFiles = async (props: Props): Promise<void> => {
  const objects = (await listBucket(props)).map(key => ({
    Key: `${TASK_LIMITATION_PREFIX}/${key}`,
  }));
  if (!objects.length) {
    return;
  }
  await props.client.send(
    new DeleteObjectsCommand({
      Bucket: props.bucketName,
      Delete: {
        Quiet: true,
        Objects: objects,
      },
    }),
  );
};
