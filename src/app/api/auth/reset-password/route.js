import { supabase } from "@/lib/supabaseClient";
import { hashPassword } from "@/lib/auth";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

export async function POST(request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return Response.json(
        { error: "Email, code, and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
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
      console.error("User not found:", email);
      return Response.json({ error: "Invalid request" }, { status: 400 });
    }

    // Verify code matches
    if (user.reset_code !== code) {
      console.error("Invalid code. Expected:", user.reset_code, "Got:", code);
      return Response.json(
        { error: "Invalid or expired reset code" },
        { status: 400 }
      );
    }

    // Check if code expired
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const expiresAt = dayjs(user.reset_expires);

    console.log("⏰ Current time:", now.format("YYYY-MM-DD HH:mm:ss"));
    console.log("⏰ Code expires:", expiresAt.format("YYYY-MM-DD HH:mm:ss"));

    if (expiresAt.isBefore(now)) {
      console.error("Code expired!");
      return Response.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update user password and clear reset code
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_hash: passwordHash,
        reset_code: null,
        reset_expires: null,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update password:", updateError);
      return Response.json(
        { error: "Failed to reset password" },
        { status: 500 }
      );
    }

    console.log("✅ Password reset successfully for:", email);

    return Response.json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
