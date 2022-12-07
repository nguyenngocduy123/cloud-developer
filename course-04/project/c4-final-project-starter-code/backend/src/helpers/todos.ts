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

export async function updateTodo(userId: string, id: string, payload: UpdateTodoRequest) : Promise<void>{
  return todoAccess.updateTodo(userId, id, payload);
}

export async function updateTodoAttachment(userId: string, todoId: string): Promise<void> {
  return todoAccess.updateTodoAttachment(userId, todoId);
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

export async function todoExists(id: string): Promise<boolean> {
  return await todoAccess.todoExists(id);
}