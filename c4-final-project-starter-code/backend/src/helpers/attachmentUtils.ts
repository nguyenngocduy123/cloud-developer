import * as AWS from 'aws-sdk';
import { createLogger } from '../utils/logger';
import { addAttachmentUrl } from './todos';

const logger = createLogger('S3 Attachment')

const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

const bucketName = process.env.ATTACHMENT_S3_BUCKET;
const urlExpiration: number = 300;

export async function createAttachmentPresignedUrl(todoId: string, userId: string) {
  logger.info(`creating upload url for todo ${todoId} on bucket ${bucketName} with expiration ${urlExpiration}`)

  const signedUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: urlExpiration
  })

  logger.info(`return signedUrl ${signedUrl}`)
  if (signedUrl) {
    await addAttachmentUrl(bucketName, todoId, userId)
    return signedUrl
  }
}
    