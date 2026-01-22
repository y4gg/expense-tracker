import { NextResponse } from "next/server";

export async function POST() {
  try {
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to change email" }, { status: 400 });
  }
}
