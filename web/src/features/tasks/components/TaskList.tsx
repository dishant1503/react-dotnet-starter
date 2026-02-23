import type { TaskItem } from "../types/task";

export function TaskList({
  tasks,
  onToggle,
  onDelete,
}: {
  tasks: TaskItem[];
  onToggle: (task: TaskItem) => Promise<void>;
  onDelete: (task: TaskItem) => Promise<void>;
}) {
  if (tasks.length === 0)
    return <p style={{ marginTop: 18 }}>No tasks yet. Add your first one.</p>;

  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 18 }}>
      {tasks.map((t) => (
        <li
          key={t.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: 10,
            marginBottom: 10,
          }}
        >
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={t.isDone}
              onChange={() => onToggle(t)}
            />
            <span
              style={{ textDecoration: t.isDone ? "line-through" : "none" }}
            >
              {t.title}
            </span>
          </label>

          <button onClick={() => onDelete(t)} style={{ padding: "6px 10px" }}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
