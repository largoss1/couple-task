import { supabase } from "./supabaseClient";

/**
 * Create a new task
 */
export async function createTask(userId, taskData) {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: taskData.title,
          description: taskData.description || null,
          due_date: taskData.dueDate || null,
          due_time: taskData.dueTime || null,
          priority: taskData.priority || 1,
          list_id: taskData.listId || null,
          tags: taskData.tags || [],
          user_id: userId,
          completed: false,
        },
      ])
      .select("*, lists(name, color, icon)")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Create task error:", error);
    throw error;
  }
}

/**
 * Get user's lists
 */
export async function getUserLists(userId) {
  try {
    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Get lists error:", error);
    throw error;
  }
}

/**
 * Parse natural language date to YYYY-MM-DD format
 */
export function parseDate(dateString) {
  if (!dateString) return null;

  const today = new Date();
  const dateStr = dateString.toLowerCase().trim();

  // Today
  if (dateStr.includes("today") || dateStr.includes("hôm nay")) {
    return today.toISOString().split("T")[0];
  }

  // Tomorrow
  if (dateStr.includes("tomorrow") || dateStr.includes("ngày mai")) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }

  // Next week
  if (dateStr.includes("next week") || dateStr.includes("tuần sau")) {
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    return nextWeek.toISOString().split("T")[0];
  }

  // Try to parse as ISO date (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  return null;
}

/**
 * Parse time string to HH:MM format
 */
export function parseTime(timeString) {
  if (!timeString) return null;

  const timeStr = timeString.toLowerCase().trim();

  // Morning
  if (timeStr.includes("morning") || timeStr.includes("sáng")) {
    return "09:00";
  }

  // Afternoon
  if (timeStr.includes("afternoon") || timeStr.includes("chiều")) {
    return "14:00";
  }

  // Evening
  if (timeStr.includes("evening") || timeStr.includes("tối")) {
    return "18:00";
  }

  // Night
  if (timeStr.includes("night") || timeStr.includes("đêm")) {
    return "21:00";
  }

  // Try to parse HH:MM format
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    return timeStr;
  }

  return null;
}
