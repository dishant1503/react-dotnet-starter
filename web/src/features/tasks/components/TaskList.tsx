import { useState } from "react";
import type { TaskItem } from "../types/task";

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  onUpdate,
}: {
  tasks: TaskItem[];
  onToggle: (task: TaskItem) => Promise<void>;
  onDelete: (task: TaskItem) => Promise<void>;
  onUpdate: (task: TaskItem, newTitle: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="checkbox"
              checked={t.isDone}
              onChange={() => onToggle(t)}
            />

            {editingId === t.id ? (
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    await onUpdate(t, editTitle.trim());
                    setEditingId(null);
                  }
                }}
                style={{ padding: 6, marginRight: 8 }}
              />
            ) : (
              <span
                style={{
                  textDecoration: t.isDone ? "line-through" : "none",
                  marginRight: 8,
                }}
              >
                {t.title}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {editingId === t.id ? (
              <button
                onClick={async () => {
                  await onUpdate(t, editTitle.trim());
                  setEditingId(null);
                }}
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingId(t.id);
                  setEditTitle(t.title);
                }}
              >
                Edit
              </button>
            )}

            <button onClick={() => onDelete(t)}>Delete</button>
          </div>
        </li>
      ))}
    </ul>
  );
}
