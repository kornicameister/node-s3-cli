import {
  ListObjectsV2Command,
  type ListObjectsV2Output,
  S3Client,
} from '@aws-sdk/client-s3';
import { faker } from '@faker-js/faker';
import { mockClient as mock } from 'aws-sdk-client-mock';
import 'aws-sdk-client-mock-jest';

import { listBucket } from '../src/actions/listBucket';

describe('action.listBucket', () => {
  const stub = mock(S3Client);
  const client = stub as unknown as S3Client;
  let bucketName: string;

  beforeEach(() => {
    bucketName = faker.string.alpha();
  });
  afterEach(() => {
    stub.reset();
  });

  it('should return empty array if content is undefined', async () => {
    stub.on(ListObjectsV2Command).resolvesOnce({
      Contents: undefined,
    } satisfies ListObjectsV2Output);

    const objects = await listBucket({ bucketName, client });

    expect(objects).toHaveLength(0);
    expect(stub).toReceiveCommandWith(ListObjectsV2Command, {
      Bucket: bucketName,
      Prefix: 'x-wing',
    });
  });

  it('should return empty array if content is empty', async () => {
    stub.on(ListObjectsV2Command).resolvesOnce({
      Contents: [],
    } satisfies ListObjectsV2Output);

    const objects = await listBucket({ bucketName, client });

    expect(objects).toHaveLength(0);
    expect(stub).toReceiveCommandWith(ListObjectsV2Command, {
      Bucket: bucketName,
      Prefix: 'x-wing',
    });
  });

  it('should return objects from bucket', async () => {
    const bucketContent = faker.helpers.multiple(() => ({
      Key: faker.string.alpha(),
    }));
    stub.on(ListObjectsV2Command).resolvesOnce({
      Contents: bucketContent,
    } satisfies ListObjectsV2Output);

    const objects = await listBucket({ bucketName, client });

    expect(objects).toHaveLength(bucketContent.length);
    expect(objects).toStrictEqual(bucketContent.map(el => el.Key));
    expect(stub).toReceiveCommandWith(ListObjectsV2Command, {
      Bucket: bucketName,
      Prefix: 'x-wing',
    });
  });

  it('should fetch next page if one is found', async () => {
    const firstPage = faker.helpers.multiple(() => ({
      Key: faker.string.alpha(),
    }));
    const firstPageToken = faker.string.alpha();
    const secondPage = faker.helpers.multiple(() => ({
      Key: faker.string.alpha(),
    }));
    stub
      .on(ListObjectsV2Command)
      .resolvesOnce({
        Contents: firstPage,
        NextContinuationToken: firstPageToken,
      } satisfies ListObjectsV2Output)
      .resolvesOnce({
        Contents: secondPage,
      } satisfies ListObjectsV2Output);

    const objects = await listBucket({ bucketName, client });

    expect(objects).toHaveLength(firstPage.length + secondPage.length);
    expect(objects).toStrictEqual([
      ...firstPage.map(el => el.Key),
      ...secondPage.map(el => el.Key),
    ]);
    expect(stub).toReceiveCommandWith(ListObjectsV2Command, {
      Bucket: bucketName,
      Prefix: 'x-wing',
    });
    expect(stub).toReceiveCommandWith(ListObjectsV2Command, {
      Bucket: bucketName,
      Prefix: 'x-wing',
      ContinuationToken: firstPageToken,
    });
  });

  it('should apply filter to list files matching regex', async () => {
    const filter = /test_.*/gi;
    const bucketContent = [{ Key: 'test_1' }, { Key: 'something' }];
    stub.on(ListObjectsV2Command).resolvesOnce({
      Contents: bucketContent,
    } satisfies ListObjectsV2Output);

    const objects = await listBucket({ bucketName, filter, client });

    expect(objects).toHaveLength(1);
    expect(objects).toStrictEqual(['test_1']);
    expect(stub).toReceiveCommandWith(ListObjectsV2Command, {
      Bucket: bucketName,
      Prefix: 'x-wing',
    });
  });
});
