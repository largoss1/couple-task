"use client";
import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isToday,
  isBefore,
} from "date-fns";
import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import "@/styles/calendar.css";

export default function CalendarView({
  tasks,
  viewMode,
  onTaskClick,
  onDateClick,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const nextPeriod = () => {
    if (viewMode === "month") setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const prevPeriod = () => {
    if (viewMode === "month") setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === "week") setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, -1));
  };

  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevPeriod}>
            <ChevronLeft size={20} />
          </button>
          <h2 className="calendar-title">
            {viewMode === "month" && format(currentDate, "MMMM yyyy")}
            {viewMode === "week" &&
              `Week of ${format(startOfWeek(currentDate), "MMM d, yyyy")}`}
            {viewMode === "day" && format(currentDate, "EEEE, MMMM d, yyyy")}
            {viewMode === "agenda" && "Agenda"}
          </h2>
          <button className="nav-btn" onClick={nextPeriod}>
            <ChevronRight size={20} />
          </button>
        </div>
        <button className="today-btn" onClick={goToToday}>
          Today
        </button>
      </div>

      {viewMode === "month" && (
        <MonthView
          tasks={tasks}
          currentDate={currentDate}
          onTaskClick={onTaskClick}
          onDateClick={onDateClick}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          tasks={tasks}
          currentDate={currentDate}
          onTaskClick={onTaskClick}
        />
      )}
      {viewMode === "day" && (
        <DayView
          tasks={tasks}
          currentDate={currentDate}
          onTaskClick={onTaskClick}
        />
      )}
      {viewMode === "agenda" && (
        <AgendaView tasks={tasks} onTaskClick={onTaskClick} />
      )}
    </div>
  );
}

// Month View (unchanged)
function MonthView({ tasks, currentDate, onTaskClick, onDateClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const rows = [];
  let days = [];
  let day = startDate;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const dayTasks = tasks.filter(
        (task) => task.due_date && isSameDay(parseISO(task.due_date), day)
      );

      const currentDay = new Date(day);

      days.push(
        <div
          key={day.toString()}
          className={`calendar-day ${
            !isSameMonth(day, monthStart) ? "other-month" : ""
          } ${isToday(day) ? "today" : ""}`}
          onClick={() => onDateClick && onDateClick(currentDay)}
        >
          <div className="day-number">{format(day, "d")}</div>
          <div className="day-tasks">
            {dayTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="calendar-task"
                style={{ background: task.lists?.color || "#6b7280" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick && onTaskClick(task);
                }}
              >
                {task.due_time && (
                  <span className="task-time">
                    {format(parseISO(`2000-01-01T${task.due_time}`), "h:mm a")}
                  </span>
                )}
                <span className="task-title-cal">{task.title}</span>
              </div>
            ))}
            {dayTasks.length > 3 && (
              <div className="more-tasks">+{dayTasks.length - 3} more</div>
            )}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="calendar-week" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="month-view">
      <div className="weekdays">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>
      <div className="month-grid">{rows}</div>
    </div>
  );
}

// Week View - FIXED VERSION
function WeekView({ tasks, currentDate, onTaskClick }) {
  const weekStart = startOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="week-view">
      <div className="week-header">
        <div className="time-gutter">GMT+7</div>
        {weekDays.map((day) => (
          <div
            key={day.toString()}
            className={`week-day-header ${isToday(day) ? "today" : ""}`}
          >
            <div className="day-name">{format(day, "EEE")}</div>
            <div className={`day-date ${isToday(day) ? "today-circle" : ""}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}
      </div>

      <div className="week-grid">
        <div className="week-grid-container">
          <div className="time-slots">
            {hours.map((hour) => (
              <div key={hour} className="time-slot">
                {format(new Date().setHours(hour, 0), "ha")}
              </div>
            ))}
          </div>

          <div className="week-columns">
            {weekDays.map((day) => {
              const dayTasks = tasks
                .filter(
                  (task) =>
                    task.due_date && isSameDay(parseISO(task.due_date), day)
                )
                .sort((a, b) => {
                  if (!a.due_time) return 1;
                  if (!b.due_time) return -1;
                  return a.due_time.localeCompare(b.due_time);
                });

              return (
                <div key={day.toString()} className="week-day-column">
                  {dayTasks.map((task) => {
                    const startHour = task.due_time
                      ? parseInt(task.due_time.split(":")[0])
                      : 9;
                    const startMinute = task.due_time
                      ? parseInt(task.due_time.split(":")[1])
                      : 0;
                    const topPosition = startHour * 60 + startMinute;

                    return (
                      <div
                        key={task.id}
                        className="week-task"
                        style={{
                          top: `${topPosition}px`,
                          background: task.lists?.color || "#6b7280",
                        }}
                        onClick={() => onTaskClick && onTaskClick(task)}
                      >
                        <span className="task-time-label">
                          {task.due_time &&
                            format(
                              parseISO(`2000-01-01T${task.due_time}`),
                              "h:mm a"
                            )}
                        </span>
                        <span className="task-title-label">{task.title}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Day View (unchanged)
function DayView({ tasks, currentDate, onTaskClick }) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayTasks = tasks
    .filter(
      (task) => task.due_date && isSameDay(parseISO(task.due_date), currentDate)
    )
    .sort((a, b) => {
      if (!a.due_time) return 1;
      if (!b.due_time) return -1;
      return a.due_time.localeCompare(b.due_time);
    });

  return (
    <div className="day-view">
      <div className="day-view-header">
        <div className="time-gutter">GMT+7</div>
        <div
          className={`day-header-cell ${isToday(currentDate) ? "today" : ""}`}
        >
          <div className="day-name">{format(currentDate, "EEEE")}</div>
          <div
            className={`day-date ${isToday(currentDate) ? "today-circle" : ""}`}
          >
            {format(currentDate, "d")}
          </div>
        </div>
      </div>
      <div className="day-grid">
        <div className="time-slots">
          {hours.map((hour) => (
            <div key={hour} className="time-slot">
              {format(new Date().setHours(hour, 0), "ha")}
            </div>
          ))}
        </div>
        <div className="day-column">
          {dayTasks.map((task) => {
            const startHour = task.due_time
              ? parseInt(task.due_time.split(":")[0])
              : 9;
            const startMinute = task.due_time
              ? parseInt(task.due_time.split(":")[1])
              : 0;
            const topPosition = startHour * 60 + startMinute;

            return (
              <div
                key={task.id}
                className="day-task"
                style={{
                  top: `${topPosition}px`,
                  background: task.lists?.color || "#6b7280",
                }}
                onClick={() => onTaskClick && onTaskClick(task)}
              >
                <div className="task-time-label">
                  {task.due_time &&
                    format(parseISO(`2000-01-01T${task.due_time}`), "h:mm a")}
                </div>
                <div className="task-title-label">{task.title}</div>
                {task.description && (
                  <div className="task-description-label">
                    {task.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Agenda View (unchanged)
function AgendaView({ tasks, onTaskClick }) {
  const today = new Date();
  const upcomingTasks = tasks
    .filter((task) => task.due_date)
    .sort((a, b) => {
      const dateA = parseISO(a.due_date);
      const dateB = parseISO(b.due_date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }
      if (!a.due_time) return 1;
      if (!b.due_time) return -1;
      return a.due_time.localeCompare(b.due_time);
    });

  const groupedTasks = upcomingTasks.reduce((groups, task) => {
    const date = format(parseISO(task.due_date), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(task);
    return groups;
  }, {});

  return (
    <div className="agenda-view">
      {Object.keys(groupedTasks).length === 0 ? (
        <div className="empty-state">
          <p>No upcoming tasks</p>
        </div>
      ) : (
        Object.entries(groupedTasks).map(([date, dateTasks]) => {
          const taskDate = parseISO(date);
          const isPast = isBefore(taskDate, new Date().setHours(0, 0, 0, 0));
          const isNow = isToday(taskDate);

          return (
            <div key={date} className="agenda-date-group">
              <div
                className={`agenda-date-header ${isNow ? "today" : ""} ${
                  isPast ? "past" : ""
                }`}
              >
                <div className="date-circle">
                  <div className="date-day">{format(taskDate, "d")}</div>
                  <div className="date-weekday">{format(taskDate, "EEE")}</div>
                </div>
                <div className="date-info">
                  <h3 className="date-title">
                    {isNow ? "Today" : format(taskDate, "EEEE, MMMM d, yyyy")}
                  </h3>
                  <span className="task-count">{dateTasks.length} tasks</span>
                </div>
              </div>
              <div className="agenda-tasks">
                {dateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="agenda-task"
                    onClick={() => onTaskClick && onTaskClick(task)}
                  >
                    <div className="task-time-indicator">
                      <Clock size={14} />
                      {task.due_time ? (
                        <span>
                          {format(
                            parseISO(`2000-01-01T${task.due_time}`),
                            "h:mm a"
                          )}
                        </span>
                      ) : (
                        <span>All day</span>
                      )}
                    </div>
                    <div className="task-content-agenda">
                      <div className="task-title-agenda">{task.title}</div>
                      {task.description && (
                        <div className="task-description-agenda">
                          {task.description}
                        </div>
                      )}
                      {task.lists && (
                        <div
                          className="task-list-badge"
                          style={{ background: task.lists.color }}
                        >
                          {task.lists.icon} {task.lists.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
