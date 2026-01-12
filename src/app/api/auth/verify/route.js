import { NextResponse } from "next/server";

export async function POST() {
  // Verification endpoint disabled. Return 404 to indicate not found.
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
