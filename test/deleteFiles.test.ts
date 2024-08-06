import {
  DeleteObjectsCommand,
  type PutObjectCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { faker } from '@faker-js/faker';
import { mockClient as mock } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';
import { type Mock, vi } from 'vitest';

import { deleteFiles } from '../src/actions/deleteFiles';
import { listBucket as _listBucket } from '../src/actions/listBucket';

vi.mock('../src/actions/listBucket');

describe('action.deleteFiles', () => {
  const stub = mock(S3Client);
  const client = stub as unknown as S3Client;

  let bucketName: string;
  let filter: RegExp;
  let listBucket: Mock;

  beforeEach(() => {
    bucketName = faker.string.alpha();
    filter = new RegExp(faker.string.alpha());

    listBucket = vi.mocked(_listBucket);
  });
  afterEach(() => {
    stub.reset();
  });

  it('should delete nothing if no files are found', async () => {
    listBucket.mockResolvedValue([]);
    stub.on(DeleteObjectsCommand).resolvesOnce({
      $metadata: {},
    } satisfies PutObjectCommandOutput);

    await deleteFiles({ bucketName, filter, client });

    expect(listBucket).toHaveBeenCalledWith({
      bucketName,
      filter,
      client,
    });
    expect(stub).not.toReceiveCommandWith(DeleteObjectsCommand, {
      Bucket: bucketName,
    });
  });

  it('should delete files if something is found', async () => {
    const keys = faker.helpers.multiple(faker.string.uuid);
    listBucket.mockResolvedValue(keys);

    stub.on(DeleteObjectsCommand).resolvesOnce({
      $metadata: {},
    } satisfies PutObjectCommandOutput);

    await deleteFiles({ bucketName, filter, client });

    expect(listBucket).toHaveBeenCalledWith({
      bucketName,
      filter,
      client,
    });
    expect(stub).toReceiveCommandWith(DeleteObjectsCommand, {
      Bucket: bucketName,
      Delete: {
        Quiet: true,
        Objects: keys.map(key => ({ Key: `x-wing/${key}` })),
      },
    });
  });
});
