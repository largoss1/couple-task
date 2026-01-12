"use client";
import {
  Circle,
  CheckCircle2,
  Calendar,
  Flag,
  Inbox,
  User,
} from "lucide-react";
import { format, parseISO } from "date-fns";

export default function TaskList({ tasks, onRefresh, onEdit }) {
  async function toggleComplete(task) {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to continue");
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: task.id,
          completed: !task.completed,
          title: task.title,
          description: task.description,
          due_date: task.due_date,
          due_time: task.due_time,
          list_id: task.list_id,
          priority: task.priority,
          tags: task.tags,
        }),
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update task");
      }

      onRefresh();
    } catch (error) {
      console.error("Toggle complete error:", error);
      alert(error.message || "Failed to update task");
    }
  }

  async function deleteTask(id, isOwnTask) {
    if (!isOwnTask) {
      alert("Only the task owner can delete this task");
      return;
    }

    if (!confirm("Delete this task?")) return;

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to continue");
        window.location.href = "/login";
        return;
      }

      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      if (response.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete task");
      }

      onRefresh();
    } catch (error) {
      console.error("Delete task error:", error);
      alert(error.message || "Failed to delete task");
    }
  }

  function getPriorityColor(priority) {
    switch (priority) {
      case 4:
        return "#ef4444";
      case 3:
        return "#f59e0b";
      case 2:
        return "#3b82f6";
      default:
        return "#6b7280";
    }
  }

  function formatDueDate(due_date) {
    if (!due_date) return null;
    try {
      const date = parseISO(due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      if (date.getTime() === today.getTime()) {
        return "Today";
      } else if (date.getTime() === today.getTime() + 86400000) {
        return "Tomorrow";
      } else if (date < today) {
        return format(date, "MMM d");
      } else {
        return format(date, "MMM d");
      }
    } catch (error) {
      return null;
    }
  }

  function isOverdue(due_date) {
    if (!due_date) return false;
    try {
      const date = parseISO(due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      return date < today;
    } catch (error) {
      return false;
    }
  }

  const overdueTasks = tasks.filter(
    (t) => !t.completed && isOverdue(t.due_date)
  );
  const todayTasks = tasks.filter(
    (t) => !t.completed && !isOverdue(t.due_date)
  );
  const completedTasks = tasks.filter((t) => t.completed);

  return (
    <div className="task-list">
      {overdueTasks.length > 0 && (
        <div className="task-section">
          <div className="section-header">
            <h3 className="section-title overdue">Overdue</h3>
            <span className="section-count">{overdueTasks.length}</span>
          </div>
          {overdueTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
              getPriorityColor={getPriorityColor}
              formatDueDate={formatDueDate}
              isOverdue={true}
            />
          ))}
        </div>
      )}

      {todayTasks.length > 0 && (
        <div className="task-section">
          <div className="section-header">
            <h3 className="section-title">Today's Tasks</h3>
            <span className="section-count">{todayTasks.length}</span>
          </div>
          {todayTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
              getPriorityColor={getPriorityColor}
              formatDueDate={formatDueDate}
              isOverdue={false}
            />
          ))}
        </div>
      )}

      {completedTasks.length > 0 && (
        <div className="task-section completed-section">
          <div className="section-header">
            <h3 className="section-title">Completed</h3>
            <span className="section-count">{completedTasks.length}</span>
          </div>
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={toggleComplete}
              onDelete={deleteTask}
              onEdit={onEdit}
              getPriorityColor={getPriorityColor}
              formatDueDate={formatDueDate}
              isOverdue={false}
            />
          ))}
        </div>
      )}

      {tasks.length === 0 && (
        <div className="empty-state">
          <Inbox size={48} className="empty-icon" />
          <p>No tasks here</p>
        </div>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
  onDelete,
  onEdit,
  getPriorityColor,
  formatDueDate,
  isOverdue,
}) {
  return (
    <div
      className={`task-item ${task.completed ? "completed" : ""} ${
        !task.isOwnTask ? "partner-task" : ""
      }`}
    >
      <div className="task-checkbox" onClick={() => onToggle(task)}>
        {task.completed ? (
          <CheckCircle2 size={20} className="check-icon completed" />
        ) : (
          <Circle
            size={20}
            className="check-icon"
            style={{ color: getPriorityColor(task.priority) }}
          />
        )}
      </div>

      <div className="task-content" onClick={() => onEdit(task)}>
        <div className="task-title-row">
          <div className="task-title">{task.title}</div>
          {!task.isOwnTask && (
            <div
              className="task-owner-badge"
              title={`Created by ${task.ownerName}`}
            >
              {task.ownerAvatar ? (
                <img src={task.ownerAvatar} alt={task.ownerName} />
              ) : (
                <User size={12} />
              )}
              <span>{task.ownerName}</span>
            </div>
          )}
        </div>
        <div className="task-meta">
          {task.description && (
            <span className="task-description">{task.description}</span>
          )}
          {task.due_date && (
            <span className={`task-date ${isOverdue ? "overdue" : ""}`}>
              <Calendar size={12} />
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.lists && (
            <span className="task-list" style={{ color: task.lists.color }}>
              {task.lists.icon} {task.lists.name}
            </span>
          )}
        </div>
      </div>

      {task.isOwnTask && (
        <button
          className="task-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id, task.isOwnTask);
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}
