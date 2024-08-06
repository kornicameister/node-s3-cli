import fs from 'fs/promises';

import { S3Client } from '@aws-sdk/client-s3';
import chalk from 'chalk';
import { Command } from 'commander';
import figlet from 'figlet';

import pkg from '../package.json';

import { deleteFiles } from './actions/deleteFiles';
import { listBucket } from './actions/listBucket';
import { uploadFile } from './actions/uploadFile';

console.log(figlet.textSync('S3 CLI'));

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
      console.log(chalk.gray('No objects found matching filter'));
    } else if (!objects.length) {
      console.log(chalk.gray('Bucket is empty'));
    } else {
      for (const object of objects) {
        console.log(`${chalk.grey('-')} ${chalk.green(object)}`);
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
    console.log(chalk.green('File uploaded'));
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
    console.log(chalk.green('Files deleted'));
  });

program.parse(process.argv);
