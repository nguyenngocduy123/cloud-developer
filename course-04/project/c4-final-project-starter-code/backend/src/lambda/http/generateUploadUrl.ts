

import 'source-map-support/register';

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import * as middy from 'middy';
import { cors, httpErrorHandler } from 'middy/middlewares';


import { createLogger } from '../../utils/logger';
import { createAttachmentPresignedUrl } from '../../helpers/attachmentUtils';
import { getUserId } from '../utils';

const logger = createLogger('attachment');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const userId = getUserId(event)
    const todoId = event.pathParameters.todoId
    logger.info('Processing event: ', event);
    const uploadUrl = await createAttachmentPresignedUrl(todoId, userId);

    logger.info(`Upload url: ${uploadUrl}`);

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
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
