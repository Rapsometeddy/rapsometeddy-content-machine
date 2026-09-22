import { createHash } from "node:crypto";

type RenderInput = {
  prompt: string;
  voice?: string;
  webhook?: string;
  telegramChatId?: string | number;
};

function err(stage:string, message:string, extra:Record<string,unknown> = {}) {
  const e = new Error(message) as Error & { stage?:string; details?:unknown };
  e.stage = stage;
  e.details = extra;
  return e;
}

export async function renderContent(input:RenderInput) {
  const traceId = createHash("sha256")
    .update(String(input.prompt) + ":" + Date.now() + ":" + Math.random())
    .digest("hex")
    .slice(0, 12);

  const stages:any[] = [
    { stage:"renderer-dispatch", status:"started" }
  ];

  const workerUrl = process.env.MEDIA_RENDERER_URL;
  if (!workerUrl) {
    throw err("renderer-dispatch", "MEDIA_RENDERER_URL service binding is missing", {
      hint:"Deploy the Vercel Services configuration so the renderer binding is injected."
    });
  }

  if (!input.telegramChatId) {
    throw err("renderer-dispatch", "telegramChatId is required for the Telegram media delivery path");
  }

  try {
    const url = new URL("/render", workerUrl);
    const headers:Record<string,string> = {
      "content-type":"application/json"
    };

    if (process.env.RENDER_WORKER_SECRET) {
      headers["x-render-secret"] = process.env.RENDER_WORKER_SECRET;
    }

    const response = await fetch(url, {
      method:"POST",
      headers,
      body:JSON.stringify({
        prompt:input.prompt,
        telegramChatId:input.telegramChatId
      }),
      signal:AbortSignal.timeout(58_000)
    });

    const raw = await response.text();
    let result:any = null;
    try { result = JSON.parse(raw); } catch {}

    if (!response.ok || !result?.ok) {
      stages[0] = {
        stage:"renderer-dispatch",
        status:"failed",
        error:{
          stage:"renderer",
          message:result?.error || raw.slice(0, 1500) || "Renderer returned an error",
          code:result?.code || null
        }
      };
      throw err(
        "renderer",
        result?.error || raw.slice(0, 1500) || "Renderer returned an error",
        { status:response.status, workerUrl:String(url), traceId }
      );
    }

    stages[0] = {
      stage:"renderer-dispatch",
      status:"ok",
      renderer:"vercel-container",
      bytes:result.bytes || null,
      telegramMessageId:result.telegramMessageId || null
    };

    return {
      ok:true,
      traceId,
      status:"rendered-and-sent",
      message:"The FFmpeg container rendered the 9:16 MP4 and sent it directly to Telegram.",
      stages,
      voiceover:{
        status:"not-requested",
        note:"The current worker renders the visual slideshow with diagnostic silent audio."
      }
    };
  } catch (e:any) {
    console.error("[MEDIA_PIPELINE]", JSON.stringify({
      traceId,
      stage:e.stage || "renderer",
      message:e.message,
      details:e.details,
      stages
    }));
    throw e;
  }
}
