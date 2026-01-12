"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "@/styles/admin.css";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingUserName, setEditingUserName] = useState("");
  const [editingTaskTitle, setEditingTaskTitle] = useState("");
  const [editingTaskDescription, setEditingTaskDescription] = useState("");
  const [editingTaskPriority, setEditingTaskPriority] = useState(2);
  const [editingTaskDueDate, setEditingTaskDueDate] = useState("");
  const [editingTaskDueTime, setEditingTaskDueTime] = useState("");
  const [editingTaskCompleted, setEditingTaskCompleted] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.isAdmin) {
      router.push("/dashboard");
    }
  }, [router]);

  // Fetch users and tasks
  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [usersRes, tasksRes] = await Promise.all([
        fetch("/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/admin/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok || !tasksRes.ok) {
        throw new Error("Failed to fetch admin data");
      }

      const usersData = await usersRes.json();
      const tasksData = await tasksRes.json();

      setUsers(usersData);
      setTasks(tasksData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.id);
    setEditingUserName(user.full_name);
  };

  const handleSaveUser = async () => {
    if (!editingUserName.trim()) {
      setError("User name cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${editingUser}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ full_name: editingUserName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      setUsers(
        users.map((u) =>
          u.id === editingUser ? { ...u, full_name: editingUserName } : u
        )
      );
      setEditingUser(null);
      setEditingUserName("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((u) => u.id !== userId));
      setTasks(tasks.filter((t) => t.user_id !== userId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task.id);
    setEditingTaskTitle(task.title || "");
    setEditingTaskDescription(task.description || "");
    setEditingTaskPriority(task.priority ?? 2);
    setEditingTaskDueDate(task.due_date || "");
    setEditingTaskDueTime(task.due_time || "");
    setEditingTaskCompleted(Boolean(task.completed));
  };

  const handleSaveTask = async () => {
    if (!editingTaskTitle.trim()) {
      setError("Task title cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const body = {
        title: editingTaskTitle.trim(),
        description: editingTaskDescription || null,
        priority: Number(editingTaskPriority) || 2,
        due_date: editingTaskDueDate || null,
        due_time: editingTaskDueTime || null,
        completed: Boolean(editingTaskCompleted),
      };

      const response = await fetch(`/api/admin/tasks/${editingTask}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error || "Failed to update task");
      }

      const updated = await response.json();

      setTasks(
        tasks.map((t) => (t.id === editingTask ? { ...t, ...updated } : t))
      );
      setEditingTask(null);
      setEditingTaskTitle("");
      setEditingTaskDescription("");
      setEditingTaskPriority(2);
      setEditingTaskDueDate("");
      setEditingTaskDueTime("");
      setEditingTaskCompleted(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/admin/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      setTasks(tasks.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  };

  const userTasks = selectedUser
    ? tasks.filter((t) => t.user_id === selectedUser)
    : [];

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👨‍💼 Admin Dashboard</h1>
        <button
          className="btn-back"
          onClick={() => {
            localStorage.clear();
            router.push("/login");
          }}
        >
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="admin-layout">
        {/* Users List */}
        <div className="admin-section">
          <h2>👥 Users ({users.length})</h2>
          <div className="users-list">
            {users.map((user) => (
              <div
                key={user.id}
                className={`user-card ${selectedUser === user.id ? "active" : ""}`}
              >
                <button
                  className="user-info"
                  onClick={() => setSelectedUser(user.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", width: "100%" }}
                >
                  {user.avatar_url && (
                    <img src={user.avatar_url} alt={user.full_name} />
                  )}
                  <div>
                    {editingUser === user.id ? (
                      <input
                        type="text"
                        value={editingUserName}
                        onChange={(e) => setEditingUserName(e.target.value)}
                        className="form-input"
                      />
                    ) : (
                      <>
                        <p className="user-name">{user.full_name}</p>
                        <p className="user-email">{user.email}</p>
                      </>
                    )}
                  </div>
                </button>
                <div className="user-actions">
                  {editingUser === user.id ? (
                    <>
                      <button
                        className="btn-small btn-success"
                        onClick={handleSaveUser}
                      >
                        Save
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => setEditingUser(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-small btn-primary"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-small btn-danger"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks List */}
        <div className="admin-section">
          <h2>📋 Tasks {selectedUser ? `(${userTasks.length})` : ""}</h2>
          {selectedUser ? (
            <div className="tasks-list">
              {userTasks.length > 0 ? (
                userTasks.map((task) => (
                  <div key={task.id} className="task-card">
                    <div className="task-info">
                      {editingTask === task.id ? (
                        <div className="edit-task-form">
                          <input
                            type="text"
                            value={editingTaskTitle}
                            onChange={(e) => setEditingTaskTitle(e.target.value)}
                            className="form-input"
                            placeholder="Title"
                          />
                          <textarea
                            value={editingTaskDescription}
                            onChange={(e) => setEditingTaskDescription(e.target.value)}
                            className="form-input"
                            placeholder="Description"
                            rows={3}
                          />
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <select
                              value={editingTaskPriority}
                              onChange={(e) => setEditingTaskPriority(e.target.value)}
                              className="form-input"
                              style={{ width: 120 }}
                            >
                              <option value={1}>1 (Low)</option>
                              <option value={2}>2 (Normal)</option>
                              <option value={3}>3 (High)</option>
                              <option value={4}>4 (Urgent)</option>
                            </select>
                            <input
                              type="date"
                              value={editingTaskDueDate}
                              onChange={(e) => setEditingTaskDueDate(e.target.value)}
                              className="form-input"
                            />
                            <input
                              type="time"
                              value={editingTaskDueTime}
                              onChange={(e) => setEditingTaskDueTime(e.target.value)}
                              className="form-input"
                            />
                          </div>
                          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
                            <input
                              type="checkbox"
                              checked={editingTaskCompleted}
                              onChange={(e) => setEditingTaskCompleted(e.target.checked)}
                            />
                            Completed
                          </label>
                        </div>
                      ) : (
                        <>
                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}
                          {task.due_date && (
                            <p className="due-date">Due: {task.due_date}</p>
                          )}
                          <p className="priority">Priority: {task.priority}/4</p>
                          {task.completed && <p style={{ color: "green", fontWeight: 600 }}>Completed</p>}
                        </>
                      )}
                    </div>
                    <div className="task-actions">
                      {editingTask === task.id ? (
                        <>
                          <button
                            className="btn-small btn-success"
                            onClick={handleSaveTask}
                          >
                            Save
                          </button>
                          <button
                            className="btn-small btn-secondary"
                            onClick={() => setEditingTask(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-small btn-primary"
                            onClick={() => handleEditTask(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-small btn-danger"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No tasks for this user</p>
              )}
            </div>
          ) : (
            <p className="empty-message">Select a user to view their tasks</p>
          )}
        </div>
      </div>
    </div>
  );
}
