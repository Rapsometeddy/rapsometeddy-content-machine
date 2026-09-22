import { NextRequest, NextResponse } from "next/server";
import { renderContent } from "../../../lib/media-pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  try {
    const body = await req.json();
    const result = await renderContent({
      prompt: String(body.prompt || "Create a short motivational tech/business video for Rapsometeddy"),
      voice: body.voice ? String(body.voice) : undefined,
      webhook: body.webhook ? String(body.webhook) : undefined,
    });
    return NextResponse.json({ ok: true, elapsedMs: Date.now()-startedAt, ...result });
  } catch (error) {
    const e = error as Error & { code?: string; cause?: unknown };
    console.error("[MEDIA_PIPELINE_FATAL]", {
      message:e.message, code:e.code, cause:e.cause, elapsedMs:Date.now()-startedAt
    });
    return NextResponse.json({
      ok:false,
      error:{stage:"pipeline", name:e.name, message:e.message, code:e.code || null},
      elapsedMs:Date.now()-startedAt
    },{status:500});
  }
}
