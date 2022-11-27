

import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';


import { createLogger } from '../../utils/logger';
import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils';

const logger = createLogger('attachment');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    logger.info('Processing event: ', event);
    const uploadUrl = createAttachmentPresignedUrl(todoId);

    logger.info('Upload url: %s', uploadUrl);

    return {
      statusCode: 202,
      body: JSON.stringify({
        uploadUrl
      })
    } 
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
