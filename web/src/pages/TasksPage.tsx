import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/errors";
import type { TaskItem } from "../features/tasks/types/task";
import { tasksApi } from "../features/tasks/services/tasksApi";
import { TaskForm } from "../features/tasks/components/TaskForm";
import { TaskList } from "../features/tasks/components/TaskList";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { logout } = useAuth();

  const onLogout = () => {
    logout();
    nav("/login", { replace: true });
  };

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

  const updateTaskTitle = async (task: TaskItem, newTitle: string) => {
    if (!newTitle) return;
    setError("");
    try {
      await tasksApi.update(task.id, {
        title: newTitle,
        isDone: task.isDone,
      });
      await load();
    } catch (e: unknown) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div className="container">
      <div className="tasksHeader">
        <h1 className="tasksTitle">Task Manager</h1>

        <button onClick={onLogout} className="btn btnPrimary">
          Logout
        </button>
      </div>

      <div className="card">
        <TaskForm onAdd={addTask} loading={loading} />

        {error && <div className="error">{error}</div>}

        <TaskList
          tasks={tasks}
          onToggle={toggleDone}
          onDelete={deleteTask}
          onUpdate={updateTaskTitle}
        />
      </div>
    </div>
  );
}
