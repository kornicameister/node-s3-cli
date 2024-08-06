import fs from 'fs/promises';

import { S3Client } from '@aws-sdk/client-s3';
import { Command } from 'commander';

import pkg from '../package.json';

import { deleteFiles } from './actions/deleteFiles';
import { listBucket } from './actions/listBucket';
import { uploadFile } from './actions/uploadFile';

const program = new Command();
program
  .version(pkg.version)
  .description(pkg.description)
  .option('--region <region>', 'AWS region to use');

const options = program.opts();

program
  .command('list')
  .description('Lists objects in bucket')
  .argument('bucketName')
  .option('--filter <filter>', 'Regex to filter objects')
  .action(async (bucketName, options) => {
    const objects = await listBucket({
      bucketName,
      filter: options.filter ? new RegExp(options.filter) : undefined,
      client: new S3Client({
        region: options['region'],
      }),
    });
    if (!objects.length && options.filter) {
      console.log('No objects found matching filter');
    } else if (!objects.length) {
      console.log('Bucket is empty');
    } else {
      for (const object of objects) {
        console.log(`- ${object}`);
      }
    }
  });

program
  .command('upload')
  .description('Uploads file to bucket')
  .argument('bucketName')
  .argument('objectKey')
  .argument('file')
  .action(async (bucketName, objectKey, file) => {
    await uploadFile({
      bucketName,
      objectKey,
      body: await fs.readFile(file, 'utf-8'),
      client: new S3Client({
        region: options['region'],
      }),
    });
    console.log('File uploaded');
  });

program
  .command('delete')
  .description('Lists objects in bucket')
  .argument('bucketName')
  .requiredOption('--filter <filter>', 'Regex to filter objects')
  .action(async (bucketName, options) => {
    await deleteFiles({
      bucketName,
      filter: new RegExp(options.filter),
      client: new S3Client({
        region: options['region'],
      }),
    });
    console.log('Files deleted');
  });

program.parse(process.argv);
