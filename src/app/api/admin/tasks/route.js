import { getUserFromToken } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// GET - Fetch all tasks
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user || !user.is_admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select(
        "id, title, description, user_id, priority, due_date, due_time, completed, created_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tasks:", error);
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      );
    }

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Admin tasks GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
