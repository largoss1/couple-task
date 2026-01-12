import { supabase } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/auth";
import { log } from "console";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

// GET: lấy tất cả task của user hiện tại
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Lấy partner_id của user
    const { data: userData } = await supabase
      .from("users")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    const partnerId = userData?.partner_id;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const listId = searchParams.get("listId");

    // Query tasks của cả user VÀ partner
    let query = supabase
      .from("tasks")
      .select(
        "*, lists(name, color, icon), users!tasks_user_id_fkey(id, full_name, email, avatar_url)"
      )
      .order("created_at", { ascending: false });

    // Filter theo user_id (bản thân và partner)
    if (partnerId) {
      query = query.or(`user_id.eq.${user.id},user_id.eq.${partnerId}`);
    } else {
      query = query.eq("user_id", user.id);
    }
    dayjs.extend(utc);
    dayjs.extend(timezone);
    // Apply filters
    if (filter === "today") {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const today = now.format("YYYY-MM-DD");
      query = query.eq("due_date", today).eq("completed", false);
    } else if (filter === "next7days") {
      const now = dayjs().tz("Asia/Ho_Chi_Minh");
      const today = now.format("YYYY-MM-DD");
      const next7days = now.add(7, "day").format("YYYY-MM-DD");
      console.log("Today:" + today);

      query = query
        .gte("due_date", today)
        .lte("due_date", next7days)
        .eq("completed", false);
      log("Next7days:" + next7days);
    } else if (filter === "inbox") {
      query = query.eq("completed", false);
    } else if (filter === "completed") {
      query = query.eq("completed", true);
    } else if (listId) {
      query = query.eq("list_id", listId).eq("completed", false);
    } else {
      query = query.eq("completed", false);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Thêm flag để phân biệt task của ai
    const tasksWithOwnership = data.map((task) => ({
      ...task,
      isOwnTask: task.user_id === user.id,
      ownerName: task.users?.full_name || task.users?.email || "Partner",
      ownerAvatar: task.users?.avatar_url,
    }));

    return NextResponse.json(tasksWithOwnership);
  } catch (error) {
    console.error("Tasks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: thêm task mới (không thay đổi)
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, due_date, due_time, list_id, priority, tags } =
      body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (title.length > 500) {
      return NextResponse.json({ error: "Title is too long" }, { status: 400 });
    }

    if (due_date && !/^\d{4}-\d{2}-\d{2}$/.test(due_date)) {
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    if (due_time && !/^\d{2}:\d{2}$/.test(due_time)) {
      return NextResponse.json({ error: "Invalid time format" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([
        {
          title: title.trim(),
          description: description?.trim() || null,
          due_date: due_date || null,
          due_time: due_time || null,
          list_id: list_id || null,
          priority: priority || 1,
          tags: tags || [],
          user_id: user.id,
          completed: false,
        },
      ])
      .select(
        "*, lists(name, color, icon), users!tasks_user_id_fkey(id, full_name, email, avatar_url)"
      );

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const taskWithOwnership = {
      ...data[0],
      isOwnTask: true,
      ownerName: user.full_name || user.email,
      ownerAvatar: user.avatar_url,
    };

    return NextResponse.json(taskWithOwnership, { status: 201 });
  } catch (error) {
    console.error("Tasks POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: cập nhật task
export async function PUT(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      title,
      description,
      due_date,
      due_time,
      list_id,
      priority,
      completed,
      tags,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Lấy partner_id
    const { data: userData } = await supabase
      .from("users")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    const partnerId = userData?.partner_id;

    // Check if task belongs to user hoặc partner
    const { data: existingTask } = await supabase
      .from("tasks")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Cho phép edit nếu là task của mình HOẶC của partner
    const canEdit =
      existingTask.user_id === user.id ||
      (partnerId && existingTask.user_id === partnerId);

    if (!canEdit) {
      return NextResponse.json(
        { error: "You don't have permission to edit this task" },
        { status: 403 }
      );
    }

    const updateData = {
      title: title?.trim(),
      description: description?.trim() || null,
      due_date: due_date || null,
      due_time: due_time || null,
      list_id: list_id || null,
      priority,
      tags: tags || [],
    };

    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completed_at = completed ? new Date().toISOString() : null;
    }

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", id)
      .select(
        "*, lists(name, color, icon), users!tasks_user_id_fkey(id, full_name, email, avatar_url)"
      );

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const taskWithOwnership = {
      ...data[0],
      isOwnTask: data[0].user_id === user.id,
      ownerName: data[0].users?.full_name || data[0].users?.email || "Partner",
      ownerAvatar: data[0].users?.avatar_url,
    };

    return NextResponse.json(taskWithOwnership);
  } catch (error) {
    console.error("Tasks PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: xoá task (chỉ owner mới được xóa)
export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    // Chỉ owner mới được xóa task của mình
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Tasks DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
