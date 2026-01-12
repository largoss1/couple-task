import { supabase } from "@/lib/supabaseClient";
import { generateVerificationCode } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return Response.json({
        message: "If an account exists, a reset code has been sent",
      });
    }

    // Generate reset code
    const resetCode = generateVerificationCode();

    // Set expiration time (15 minutes)
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const now = dayjs().tz("Asia/Ho_Chi_Minh");
    const resetExpires = now.add(15, "minutes");

    console.log("🔐 Generated reset code:", resetCode);
    console.log("📧 Email:", email);
    console.log("⏰ Expires at:", resetExpires.format("YYYY-MM-DD HH:mm:ss"));

    // Update user with reset code
    const { error: updateError } = await supabase
      .from("users")
      .update({
        reset_code: resetCode,
        reset_expires: resetExpires.format("YYYY-MM-DD HH:mm:ss"),
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Database error:", updateError);
      return Response.json(
        { error: "Failed to generate reset code" },
        { status: 500 }
      );
    }

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetCode);

    if (!emailResult.success) {
      console.error("Email sending failed:", emailResult.error);
      return Response.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    console.log("✅ Reset code sent successfully");

    return Response.json({
      message: "Reset code sent successfully",
      emailSent: true,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
