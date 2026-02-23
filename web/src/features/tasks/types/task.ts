export type TaskItem = {
  id: string;
  title: string;
  isDone: boolean;
};

export type CreateTaskRequest = {
  title: string;
};

export type UpdateTaskRequest = {
  title: string;
  isDone: boolean;
};
