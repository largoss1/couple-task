import { supabase } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/auth";

// GET: lấy tất cả lists của user
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("lists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.error("Lists GET error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST: thêm list mới
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, icon, color } = body;

    if (!name || name.trim().length === 0) {
      return Response.json({ error: "List name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lists")
      .insert([
        {
          name: name.trim(),
          icon: icon || "📁",
          color: color || "#6c757d",
          user_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data[0], { status: 201 });
  } catch (error) {
    console.error("Lists POST error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: cập nhật list
export async function PUT(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, icon, color } = body;

    if (!id) {
      return Response.json({ error: "List ID is required" }, { status: 400 });
    }

    if (!name || name.trim().length === 0) {
      return Response.json({ error: "List name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("lists")
      .update({
        name: name.trim(),
        icon: icon || "📁",
        color: color || "#6c757d",
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return Response.json({ error: "List not found" }, { status: 404 });
    }

    return Response.json(data[0]);
  } catch (error) {
    console.error("Lists PUT error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: xoá list
export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
      return Response.json({ error: "List ID is required" }, { status: 400 });
    }

    // Check if list has tasks
    const { data: tasks } = await supabase
      .from("tasks")
      .select("id")
      .eq("list_id", id)
      .eq("user_id", user.id);

    if (tasks && tasks.length > 0) {
      return Response.json(
        {
          error:
            "Cannot delete list with tasks. Please move or delete tasks first.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("lists")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      success: true,
      message: "List deleted successfully",
    });
  } catch (error) {
    console.error("Lists DELETE error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
