import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { deleteTodo, todoExists } from '../../helpers/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const logger = createLogger(`Delete todo event: ${event}`)
    logger.info(`start delete ${event.pathParameters.todoId}`)

    const todoId = event.pathParameters.todoId
    // Remove a TODO item by id
    logger.info(`get user id`)
    const userId = getUserId(event)
    logger.info(`end get user id: ${userId}`)
    logger.info(`get todo id: ${todoId}`)
    const validTodo = await todoExists(todoId, userId)
    logger.info(`end get todo id: ${validTodo}`)
    if (!validTodo) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({
          error: 'Todo does not exist'
        })
      }
    }
    
    await deleteTodo(todoId, userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({})
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
