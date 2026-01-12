"use client";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  X,
  Loader2,
  Bot,
  User,
  CheckCircle,
} from "lucide-react";
import "@/styles/ai-assistant.css";

export default function AIAssistant({ tasks, onClose, onTaskCreated }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        'Hi! I\'m your AI assistant. I can help you organize tasks, suggest priorities, and **create new tasks** for you. Just tell me what you need!\n\nExamples:\n• "Add a task to buy groceries tomorrow"\n• "Create a meeting reminder for 2pm"\n• "Schedule gym workout for next week"',
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          context: {
            tasksCount: tasks.length,
            upcomingTasks: tasks.filter((t) => !t.completed).length,
            completedTasks: tasks.filter((t) => t.completed).length,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get AI response");
      }

      // Check if a task was created
      if (data.taskCreated) {
        console.log("✅ Task created:", data.taskCreated);

        // Refresh task list
        if (onTaskCreated) {
          setTimeout(() => {
            onTaskCreated();
          }, 500);
        }

        // Add success indicator to message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
            taskCreated: data.taskCreated,
          },
        ]);
      } else {
        // Normal chat response
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.message,
          },
        ]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const upcomingTasks = tasks
        .filter((t) => !t.completed)
        .slice(0, 10)
        .map((t) => ({
          title: t.title,
          due_date: t.due_date,
          priority: t.priority,
        }));

      const response = await fetch(
        `/api/ai/assistant?tasks=${encodeURIComponent(
          JSON.stringify(upcomingTasks)
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.suggestions || "No suggestions at the moment.",
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-assistant-container">
      <div className="ai-header">
        <div className="ai-header-content">
          <div className="ai-icon">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="ai-title">AI Assistant</h3>
            <p className="ai-subtitle">Powered by Google Gemini 2.0</p>
          </div>
        </div>
        <button className="ai-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="quick-actions">
        <button
          className="quick-action-btn"
          onClick={getSuggestions}
          disabled={loading}
        >
          <Sparkles size={14} />
          Get Suggestions
        </button>
        <button
          className="quick-action-btn"
          onClick={() => setInput("What should I prioritize today?")}
        >
          Prioritize Tasks
        </button>
        <button
          className="quick-action-btn"
          onClick={() => setInput("Add a task to call mom tomorrow at 3pm")}
        >
          Create Task
        </button>
      </div>

      <div className="ai-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${
              message.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            <div className="message-avatar">
              {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className="message-content">
              <div className="message-text">{message.content}</div>

              {/* Show task creation confirmation */}
              {message.taskCreated && (
                <div className="function-results">
                  <div className="function-result success">
                    <CheckCircle size={14} />
                    <span>
                      Task created: "{message.taskCreated.title}"
                      {message.taskCreated.dueDate &&
                        ` (${message.taskCreated.dueDate})`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant-message">
            <div className="message-avatar">
              <Bot size={16} />
            </div>
            <div className="message-content">
              <div className="message-loading">
                <Loader2 size={16} className="spinner" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="ai-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="ai-input"
          placeholder="Ask me anything or create a task..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="ai-send-btn"
          disabled={!input.trim() || loading}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
