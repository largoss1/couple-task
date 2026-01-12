import { supabase } from "@/lib/supabaseClient";
import { comparePassword, createSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // NOTE: Email verification is disabled — allow login even if email_verified is false.

    // Verify password (skip for Google users)
    if (!user.google_id) {
      const isValid = await comparePassword(password, user.password_hash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
    }

    // Create session
    const session = await createSession(user.id);

    return NextResponse.json({
      message: "Login successful",
      token: session.token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        isAdmin: user.is_admin || false,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
