import * as uuid from 'uuid';
import { TodoItem } from '../models/TodoItem';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoAccess } from './todosAcess';

const todoAccess = new TodoAccess()

export async function getTodos(userId: string): Promise<TodoItem[]> {
  return todoAccess.getTodosForUser(userId);
}

export async function getTodo(userId: string, todoId: string): Promise<TodoItem> {
  return todoAccess.getTodo(userId, todoId);
}

export async function updateTodo(userId: string, todoId: string, payload: UpdateTodoRequest) : Promise<void>{
  return todoAccess.updateTodo(userId, todoId, payload);
}

export async function addAttachmentUrl(bucketName, todoId, userId) {
  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`

  await todoAccess.updateTodoAttachment(userId, todoId , attachmentUrl)
}

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
  await todoAccess.deleteTodo(todoId, userId)
}


export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> {
  const todoId: string = uuid.v4();

  return await todoAccess.createTodo({
    todoId,
    userId,
    name: createTodoRequest.name,
    done: false,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate
  })
}

export async function todoExists(todoId: string, userId: string): Promise<boolean> {
  return await todoAccess.todoExists(todoId, userId);
}