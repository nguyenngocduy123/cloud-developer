import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodoAccess {
    constructor(
      private readonly dbContext: DocumentClient = createDbContext(),
      private readonly todoTable = process.env.TODOS_TABLE,
      private readonly attachmentBucket = process.env.ATTACHMENT_S3_BUCKET) {
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
  
    async deleteTodo(userId: string, id: string): Promise<void> {
      await this.dbContext.delete({
        TableName: this.todoTable,
        Key: {
          id,
          userId
        }
      }).promise();
  
      return;
    }
  
    async updateTodo(userId: string, id: string, todo: UpdateTodoRequest): Promise<void> {
      logger.info('Starting update todo: ', todo);
      await this.dbContext.update({
        TableName: this.todoTable,
        Key: { id, userId },
        UpdateExpression: 'set #name = :updateName, #done = :doneStatus, #dueDate = :updateDueDate',
        ExpressionAttributeNames: { '#name': 'name', '#done': 'done', '#dueDate': 'dueDate' },
        ExpressionAttributeValues: {
          ':updateName': todo.name,
          ':doneStatus': todo.done,
          ':updateDueDate': todo.dueDate,
        },
        ReturnValues: "UPDATED_NEW"
      }).promise();
  
      return;
    }
    
    async updateTodoAttachment(userId: string, id: string): Promise<void> {
      await this.dbContext.update({
        TableName: this.todoTable,
        Key: { id, userId },
        UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
        ExpressionAttributeNames: { '#attachmentUrl': 'attachmentUrl' },
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${this.attachmentBucket}.s3.amazonaws.com/${id}`
        },
        ReturnValues: "UPDATED_NEW"
      }).promise();
    }
  
    async todoExists(id: string): Promise<boolean> {
      const result = await this.dbContext
        .get({
          TableName: this.todoTable,
          Key: {
            id
          }
        })
        .promise()
    
      return !!result.Item
    }
  }
  
  function createDbContext() {
    if (process.env.IS_OFFLINE) {
      return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
      })
    }
  
    return new XAWS.DynamoDB.DocumentClient()
  }