import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';
import { createTodo } from '../../helpers/todos'

const logger = createLogger('TodosAccess')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newTodo: CreateTodoRequest = JSON.parse(event.body);
    const userId: string = getUserId(event);
    logger.info('Starting create new todo!');
    
    const todo = await createTodo(newTodo, userId);

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      statusCode: 201,
      body: JSON.stringify({
        item: todo
      })
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
