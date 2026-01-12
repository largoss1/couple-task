"use client";
import { useState, useEffect } from "react";
import { X, Calendar, Flag, Tag, List, Clock, Loader2 } from "lucide-react";

export default function TaskModal({ task, lists, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [listId, setListId] = useState("");
  const [priority, setPriority] = useState(1);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setDueDate(task.due_date || "");
      setDueTime(task.due_time || "");
      setListId(task.list_id || "");
      setPriority(task.priority || 1);
      setTags(task.tags || []);
    }
  }, [task]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Tiêu đề Task không được để trống");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Đăng nhập lại đi bạn ơi");
        return;
      }

      const method = task ? "PUT" : "POST";
      const body = {
        title: title.trim(),
        description: description.trim(),
        due_date: dueDate || null,
        due_time: dueTime || null,
        list_id: listId || null,
        priority,
        tags,
      };

      if (task) {
        body.id = task.id;
      }

      const response = await fetch("/api/tasks", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Tạo task thất bại");
      }

      onSave();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const priorityOptions = [
    { value: 1, label: "Priority 1", color: "#6b7280" },
    { value: 2, label: "Priority 2", color: "#3b82f6" },
    { value: 3, label: "Priority 3", color: "#f59e0b" },
    { value: 4, label: "Priority 4", color: "#ef4444" },
  ];

  // Set minimum date to today
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{task ? "Edit Task" : "Add New Task"}</h3>
          <button className="modal-close" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && (
            <div className="error-message">
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <input
              type="text"
              className="form-input task-title-input"
              placeholder="Task name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              maxLength={500}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <textarea
              className="form-input"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} /> Due Date
              </label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={today}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} /> Time
              </label>
              <input
                type="time"
                className="form-input"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Flag size={16} /> Priority
            </label>
            <div className="priority-buttons">
              {priorityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`priority-btn ${
                    priority === opt.value ? "active" : ""
                  }`}
                  style={{
                    borderColor: priority === opt.value ? opt.color : "#333",
                    color: priority === opt.value ? opt.color : "#999",
                  }}
                  onClick={() => setPriority(opt.value)}
                  disabled={loading}
                >
                  <Flag
                    size={14}
                    fill={priority === opt.value ? opt.color : "none"}
                  />
                  P{opt.value}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <List size={16} /> List
            </label>
            <select
              className="form-input"
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              disabled={loading}
            >
              <option value=""></option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.icon} {list.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Saving...
                </>
              ) : task ? (
                "Save Changes"
              ) : (
                "Add Task"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
