import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodoAccess {
    constructor(
      private readonly dbContext: DocumentClient = createDbContext(),
      private readonly todoTable = process.env.TODOS_TABLE) {
    }
  
    async getTodosForUser(userId: string): Promise<TodoItem[]> {
  
      const result = await this.dbContext.query({
        TableName: this.todoTable,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId
        },
        
      }).promise()
      const items = result.Items
  
      return items as TodoItem[]
    }
  
    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
      const result = await this.dbContext.get({
          TableName: this.todoTable,
          Key: {
              todoId,
              userId
          }
      }).promise();
  
      return result.Item as TodoItem;
  }
  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
      await this.dbContext.put({
        TableName: this.todoTable,
        Item: todo
      }).promise()
  
      return todo;
    }
  
    async deleteTodo(todoId: string, userId: string): Promise<void> {
      try {
        await this.dbContext.delete({
          TableName: this.todoTable,
          Key: {
            todoId,
            userId
          }
        }).promise()
      } catch (err) {
        createLogger(`Error while deleting document: ${err}`)
      }
    }
  
    async updateTodo(userId: string, todoId: string, todo: UpdateTodoRequest): Promise<void> {
      logger.info(`Starting update todo user: ${userId} -  todo: ${todoId}`);
      await this.dbContext.update({
        TableName: this.todoTable,
        Key: {
          todoId,
          userId
        },
        ExpressionAttributeNames: {
          '#N': 'name'
        },
        UpdateExpression: 'SET #N = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeValues: {
          ':name': todo.name,
          ':dueDate': todo.dueDate,
          ':done': todo.done
        },
      }).promise();
  
      return;
    }
    
    async updateTodoAttachment(userId: string, todoId: string, attachmentUrl: string): Promise<void> {
      logger.info(`Starting updateTodoAttachment todo: ${todoId} and attachmentUrl: ${attachmentUrl}`);
      await this.dbContext.update({
        TableName: this.todoTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression: 'SET attachmentUrl = :attachment',
        ExpressionAttributeValues: {
          ':attachment': attachmentUrl
        }
      }).promise()

      logger.info('Updated Attachment Successed')
    }
  
    async todoExists(todoId: string, userId: string): Promise<boolean> {
      
      const result = await this.dbContext
        .get({
          TableName: this.todoTable,
          Key: {
            todoId,
            userId
          }
        })
        .promise()
    
      return !!result.Item
    }
  }
  
  function createDbContext() {
    return new XAWS.DynamoDB.DocumentClient()
  }