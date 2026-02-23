import { http } from "../../../api/http";
import type {
  TaskItem,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "../types/task";

export const tasksApi = {
  list: () => http<TaskItem[]>("/api/tasks"),

  create: (body: CreateTaskRequest) =>
    http<TaskItem>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (id: string, body: UpdateTaskRequest) =>
    http<TaskItem>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    http<void>(`/api/tasks/${id}`, {
      method: "DELETE",
    }),
};
