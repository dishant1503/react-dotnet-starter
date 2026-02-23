import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/errors";
import type { TaskItem } from "../features/tasks/types/task";
import { tasksApi } from "../features/tasks/services/tasksApi";
import { TaskForm } from "../features/tasks/components/TaskForm";
import { TaskList } from "../features/tasks/components/TaskList";

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const data = await tasksApi.list();
      setTasks(data);
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to load tasks");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addTask = async (title: string) => {
    setLoading(true);
    setError("");
    try {
      await tasksApi.create({ title });
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const toggleDone = async (task: TaskItem) => {
    setError("");
    try {
      await tasksApi.update(task.id, {
        title: task.title,
        isDone: !task.isDone,
      });
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to update task");
    }
  };

  const deleteTask = async (task: TaskItem) => {
    setError("");
    try {
      await tasksApi.remove(task.id);
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e) || "Failed to delete task");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 16 }}>
      <h1>Task Manager</h1>

      <TaskForm onAdd={addTask} loading={loading} />

      {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

      <TaskList tasks={tasks} onToggle={toggleDone} onDelete={deleteTask} />
    </div>
  );
}
