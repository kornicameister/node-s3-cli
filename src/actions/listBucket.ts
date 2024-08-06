import { ListObjectsV2Command, type S3Client } from '@aws-sdk/client-s3';

import { TASK_LIMITATION_PREFIX } from '../constraints';

interface Props {
  bucketName: string;
  filter?: RegExp | undefined;
  client: S3Client;
}

export const listBucket = async (
  props: Props,
): Promise<ReadonlyArray<string>> => {
  let allKeys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const objects = await props.client.send(
      new ListObjectsV2Command({
        Bucket: props.bucketName,
        Prefix: TASK_LIMITATION_PREFIX,
        // typing is skewed here for whatever reason
        ContinuationToken: continuationToken as string,
      }),
    );

    if (objects.Contents) {
      let keys = objects.Contents.map(element =>
        element.Key?.replace(`${TASK_LIMITATION_PREFIX}/`, ''),
      ).filter(element => typeof element !== 'undefined');
      if (props.filter) {
        keys = keys.filter(key => props.filter?.test(key));
      }
      allKeys = allKeys.concat(keys);
    }

    continuationToken = objects.NextContinuationToken;
  } while (continuationToken);

  return allKeys;
};
