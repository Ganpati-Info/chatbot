import { NextResponse } from "next/server";
import { generateLeadSummary } from "@/lib/generateLeadSummary";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const conversation =
      typeof body.conversation === "string" ? body.conversation.trim() : "";

    const summary = await generateLeadSummary(conversation);

    return NextResponse.json({
      success: true,
      summary,
    });
  } catch (error) {
    console.error("Lead summary API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to generate lead summary.",
      },
      { status: 500 },
    );
  }
}
