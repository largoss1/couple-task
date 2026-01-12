import { supabase } from "@/lib/supabaseClient";
import { getUserFromToken } from "@/lib/auth";
import { NextResponse } from "next/server";

// POST: Link với partner bằng email
export async function POST(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { partnerEmail } = await request.json();

    if (!partnerEmail || !partnerEmail.trim()) {
      return NextResponse.json(
        { error: "Partner email is required" },
        { status: 400 }
      );
    }

    // Tìm partner
    const { data: partner, error: partnerError } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url, partner_id")
      .eq("email", partnerEmail.trim())
      .single();

    if (partnerError || !partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    if (partner.id === user.id) {
      return NextResponse.json(
        { error: "You cannot link with yourself" },
        { status: 400 }
      );
    }

    // Check if partner already has a partner
    if (partner.partner_id && partner.partner_id !== user.id) {
      return NextResponse.json(
        { error: "This user already has a partner" },
        { status: 400 }
      );
    }

    // Link cả 2 chiều
    const { error: updateError1 } = await supabase
      .from("users")
      .update({ partner_id: partner.id })
      .eq("id", user.id);

    const { error: updateError2 } = await supabase
      .from("users")
      .update({ partner_id: user.id })
      .eq("id", partner.id);

    if (updateError1 || updateError2) {
      console.error("Link error:", updateError1 || updateError2);
      return NextResponse.json(
        { error: "Failed to link partner" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Partner linked successfully",
      partner: {
        id: partner.id,
        email: partner.email,
        fullName: partner.full_name,
        avatarUrl: partner.avatar_url,
      },
    });
  } catch (error) {
    console.error("Partner link error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET: Lấy thông tin partner
export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    if (!userData?.partner_id) {
      return NextResponse.json({ partner: null });
    }

    const { data: partner } = await supabase
      .from("users")
      .select("id, email, full_name, avatar_url")
      .eq("id", userData.partner_id)
      .single();

    return NextResponse.json({
      partner: partner
        ? {
            id: partner.id,
            email: partner.email,
            fullName: partner.full_name,
            avatarUrl: partner.avatar_url,
          }
        : null,
    });
  } catch (error) {
    console.error("Get partner error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Unlink partner
export async function DELETE(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    const user = await getUserFromToken(token);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: userData } = await supabase
      .from("users")
      .select("partner_id")
      .eq("id", user.id)
      .single();

    if (!userData?.partner_id) {
      return NextResponse.json(
        { error: "You don't have a partner" },
        { status: 400 }
      );
    }

    // Unlink cả 2 chiều
    await supabase.from("users").update({ partner_id: null }).eq("id", user.id);

    await supabase
      .from("users")
      .update({ partner_id: null })
      .eq("id", userData.partner_id);

    return NextResponse.json({
      success: true,
      message: "Partner unlinked successfully",
    });
  } catch (error) {
    console.error("Unlink partner error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
