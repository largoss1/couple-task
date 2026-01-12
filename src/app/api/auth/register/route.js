import { supabase } from "@/lib/supabaseClient";
import { hashPassword, createSession } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password, fullName } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Hash password. We will mark email as verified immediately (no email verification step).
    const passwordHash = await hashPassword(password);

    // Create user (email verified immediately)
    const { data: user, error } = await supabase
      .from("users")
      .insert([
        {
          email,
          password_hash: passwordHash,
          full_name: fullName || null,
          email_verified: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({ error: "Registration failed" }, { status: 500 });
    }

    // Create a session and return token + user so the client is logged in immediately
    try {
      const session = await createSession(user.id);
      return NextResponse.json(
        {
          message: "Registration successful.",
          user: user,
          token: session.token,
        },
        { status: 201 }
      );
    } catch (e) {
      console.error("Session creation failed:", e);
      return NextResponse.json(
        { message: "Registration successful, but login failed.", userId: user.id },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
