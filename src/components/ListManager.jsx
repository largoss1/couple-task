import { useState } from "react";
import { Plus, X, Folder, Save } from "lucide-react";
import "@/styles/list.css";

export default function ListManager({ lists, onRefresh }) {
  const [showAddList, setShowAddList] = useState(false);
  const [listName, setListName] = useState("");
  const [listIcon, setListIcon] = useState("📁");
  const [listColor, setListColor] = useState("#6c757d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const predefinedIcons = [
    "📁",
    "🏠",
    "💼",
    "🎯",
    "📚",
    "🛒",
    "✈️",
    "💪",
    "🎨",
    "🎵",
  ];
  const predefinedColors = [
    "#dc4c3e", // red
    "#f59e0b", // orange
    "#10b981", // green
    "#3b82f6", // blue
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#6b7280", // gray
    "#14b8a6", // teal
  ];

  async function handleAddList(e) {
    e.preventDefault();
    setError("");

    if (!listName.trim()) {
      setError("List name is required");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: listName.trim(),
          icon: listIcon,
          color: listColor,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create list");
      }

      // Reset form
      setListName("");
      setListIcon("📁");
      setListColor("#6c757d");
      setShowAddList(false);
      onRefresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!showAddList) {
    return (
      <div className="add-list-btn-container">
        <button className="add-list-btn" onClick={() => setShowAddList(true)}>
          <Plus size={16} />
          <span>Add List</span>
        </button>
      </div>
    );
  }

  return (
    <div className="add-list-form-container">
      <div className="add-list-header">
        <h4>Create New List</h4>
        <button
          className="close-form-btn"
          onClick={() => {
            setShowAddList(false);
            setError("");
            setListName("");
          }}
          disabled={loading}
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleAddList} className="add-list-form">
        {error && <div className="error-message-small">{error}</div>}

        <div className="form-group-small">
          <label className="form-label-small">List Name</label>
          <input
            type="text"
            className="form-input-small"
            placeholder="e.g., Shopping, Work, Personal"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            maxLength={50}
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="form-group-small">
          <label className="form-label-small">Icon</label>
          <div className="icon-picker">
            {predefinedIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`icon-option ${listIcon === icon ? "active" : ""}`}
                onClick={() => setListIcon(icon)}
                disabled={loading}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group-small">
          <label className="form-label-small">Color</label>
          <div className="color-picker">
            {predefinedColors.map((color) => (
              <button
                key={color}
                type="button"
                className={`color-option ${
                  listColor === color ? "active" : ""
                }`}
                style={{ background: color }}
                onClick={() => setListColor(color)}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="save-list-btn"
          disabled={loading || !listName.trim()}
        >
          {loading ? (
            <>
              <div className="spinner-small" />
              Creating...
            </>
          ) : (
            <>
              <Save size={14} />
              Create List
            </>
          )}
        </button>
      </form>
    </div>
  );
}
