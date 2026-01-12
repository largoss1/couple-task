"use client";
import { Calendar, Inbox, CheckSquare, LogOut } from "lucide-react";
import ListManager from "./ListManager";
import PartnerLink from "./PartnerLink";

export default function Sidebar({
  currentFilter,
  currentListId,
  onFilterChange,
  onListChange,
  lists,
  onRefreshLists,
  user,
  onLogout,
  onPartnerLinked, // NEW: callback khi partner được link
}) {
  const getInitials = (name) => {
    if (!name) return user?.email?.[0]?.toUpperCase() || "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar" title={user?.fullName || user?.email}>
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" />
            ) : (
              getInitials(user?.fullName)
            )}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.fullName || "User"}</div>
            <div className="user-email">{user?.email}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={onLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>

      {/* NEW: Partner Link Component */}
      <PartnerLink onPartnerLinked={onPartnerLinked} />

      <div className="menu-section">
        <div
          className={`menu-item ${currentFilter === "inbox" ? "active" : ""}`}
          onClick={() => onFilterChange("inbox")}
        >
          <Inbox size={18} />
          <span>Inbox</span>
        </div>

        <div
          className={`menu-item ${currentFilter === "today" ? "active" : ""}`}
          onClick={() => onFilterChange("today")}
        >
          <Calendar size={18} />
          <span>Today</span>
        </div>

        <div
          className={`menu-item ${
            currentFilter === "next7days" ? "active" : ""
          }`}
          onClick={() => onFilterChange("next7days")}
        >
          <Calendar size={18} />
          <span>Next 7 Days</span>
        </div>
      </div>

      <div className="menu-section">
        <p className="section-title">My Lists</p>
        {lists.map((list) => (
          <div
            key={list.id}
            className={`menu-item ${currentListId === list.id ? "active" : ""}`}
            onClick={() => onListChange(list.id)}
          >
            <span className="list-icon" style={{ color: list.color }}>
              {list.icon}
            </span>
            <span>{list.name}</span>
          </div>
        ))}

        <ListManager lists={lists} onRefresh={onRefreshLists} />
      </div>

      <div className="menu-section">
        <p className="section-title">Filters</p>
        <div
          className={`menu-item ${
            currentFilter === "completed" ? "active" : ""
          }`}
          onClick={() => onFilterChange("completed")}
        >
          <CheckSquare size={18} />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}
