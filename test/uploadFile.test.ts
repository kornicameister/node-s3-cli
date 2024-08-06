import {
  PutObjectCommand,
  type PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { faker } from '@faker-js/faker';
import { mockClient as mock } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';

import { uploadFile } from '../src/actions/uploadFile';

describe('action.uploadFile', () => {
  const stub = mock(S3Client);
  const client = stub as unknown as S3Client;
  let bucketName: string;
  let objectKey: string;
  let body: string;

  beforeEach(() => {
    bucketName = faker.string.alpha();
    objectKey = faker.string.alpha();
    body = 'x'.repeat(6 * 1024 * 1024);
  });
  afterEach(() => {
    stub.reset();
  });

  it('should upload file', async () => {
    stub.on(PutObjectCommand).resolvesOnce({
      $metadata: {},
    } satisfies PutObjectCommandOutput);

    await uploadFile({ bucketName, objectKey, body, client });

    expect(stub).toReceiveCommandWith(PutObjectCommand, {
      Bucket: bucketName,
      Key: `x-wing/${objectKey}`,
      Body: body,
    });
  });
});
