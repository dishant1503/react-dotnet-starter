import { useState } from "react";

export function TaskForm({
  onAdd,
  loading,
}: {
  onAdd: (title: string) => Promise<void>;
  loading: boolean;
}) {
  const [title, setTitle] = useState("");

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const trimmed = title.trim();
        if (!trimmed) return;
        await onAdd(trimmed);
        setTitle("");
      }}
      style={{ display: "flex", gap: 8, marginTop: 16 }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a task…"
        style={{ flex: 1, padding: 10 }}
      />
      <button disabled={loading} style={{ padding: "10px 14px" }}>
        {loading ? "Adding..." : "Add"}
      </button>
    </form>
  );
}
