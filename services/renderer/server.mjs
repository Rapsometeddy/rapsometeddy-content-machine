import http from "node:http";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PORT = Number(process.env.PORT || 80);
const BOT_TOKEN = process.env.BOT_TOKEN || "";
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || process.env.POLLINATIONS_KEY || "";
const RENDER_SECRET = process.env.RENDER_WORKER_SECRET || "";

function json(res, status, body) {
  res.writeHead(status, {"content-type":"application/json; charset=utf-8"});
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", chunk => {
      data += chunk;
      if (data.length > 100_000) reject(new Error("Request body too large"));
    });
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); }
      catch { reject(new Error("Invalid JSON")); }
    });
    req.on("error", reject);
  });
}

function scenePrompts(prompt) {
  return Array.from({length:7}, (_, i) =>
    `${prompt}. Scene ${i+1} of 7. Cinematic vertical 9:16 composition, consistent character and world, no readable text, polished short-form social video visual.`
  );
}

async function downloadScene(prompt, file) {
  const query = new URLSearchParams({
    width:"720",
    height:"1280",
    nologo:"true"
  });
  if (POLLINATIONS_API_KEY) query.set("key", POLLINATIONS_API_KEY);

  const primary = "https://gen.pollinations.ai/image/" + encodeURIComponent(prompt) + "?" + query;
  const headers = {accept:"image/*"};
  if (POLLINATIONS_API_KEY) headers.authorization = "Bearer " + POLLINATIONS_API_KEY;

  let response = await fetch(primary, {headers});

  if (response.status === 401) {
    const legacy = "https://image.pollinations.ai/prompt/" + encodeURIComponent(prompt) +
      "?width=720&height=1280&nologo=true&model=flux";
    response = await fetch(legacy, {headers:{accept:"image/*"}});
  }

  if (!response.ok) {
    throw new Error("Scene image HTTP " + response.status);
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (!bytes.length) throw new Error("Scene image was empty");
  await fs.writeFile(file, bytes);
  return bytes.length;
}
async function sendTelegramPhoto(chatId, file, caption) {
  if (!BOT_TOKEN) throw new Error("BOT_TOKEN is not configured on renderer");
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("photo", new Blob([await fs.readFile(file)], {type:"image/png"}), "rapsometeddy.png");
  if (caption) form.append("caption", caption);

  const response = await fetch("https://api.telegram.org/bot" + BOT_TOKEN + "/sendPhoto", {
    method:"POST",
    body:form
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error("Telegram sendPhoto failed: " + (result.description || response.status));
  }
  return result;
}

async function render(body) {
  const prompt = String(body.prompt || "Create a Rapsometeddy AI, tech and entrepreneurship visual.");
  const chatId = body.telegramChatId;
  if (!chatId) throw new Error("telegramChatId is required");

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "rapsometeddy-images-"));
  const images = [];

  try {
    for (let i = 0; i < 7; i++) {
      const file = path.join(dir, "scene-" + (i + 1) + ".png");
      await downloadScene(
        `${prompt}. Image ${i + 1} of 7. Vertical 9:16 social-media image, polished Rapsometeddy visual, consistent visual identity, no readable text.`,
        file
      );
      images.push(file);
    }

    for (let i = 0; i < images.length; i++) {
      await sendTelegramPhoto(
        chatId,
        images[i],
        `🖼️ Rapsometeddy — image ${i + 1}/${images.length}`
      );
    }

    return {
      ok:true,
      status:"images-sent",
      count:images.length,
      telegramMessageIds:[],
      media:"images-only"
    };
  } finally {
    await fs.rm(dir, {recursive:true, force:true}).catch(() => {});
  }
}
async function render(body) {
  const prompt = String(body.prompt || "Create a cinematic Rapsometeddy AI, tech and entrepreneurship short.");
  const chatId = body.telegramChatId;
  if (!chatId) throw new Error("telegramChatId is required");

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "rapsometeddy-render-"));
  const images = [];

  try {
    for (let i = 0; i < 7; i++) {
      images.push(path.join(dir, "scene-" + i + ".png"));
      await downloadScene(scenePrompts(prompt)[i], images[i]);
    }

    const video = await buildVideo(dir, images);
    const stat = await fs.stat(video);
    if (stat.size > 50 * 1024 * 1024) {
      throw new Error("Rendered MP4 is over Telegram's 50 MB bot upload limit");
    }

    const sent = await sendTelegramVideo(
      chatId,
      video,
      "🎬 Rapsometeddy final short"
    );

    return {
      ok:true,
      status:"rendered-and-sent",
      bytes:stat.size,
      telegramMessageId:sent.result?.message_id || null
    };
  } finally {
    await fs.rm(dir, {recursive:true, force:true}).catch(() => {});
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === "GET" && req.url === "/health") {
    return json(res, 200, {
      ok:true,
      service:"rapsometeddy-ffmpeg-renderer",
      ffmpeg:"system",
      configured:{telegram:Boolean(BOT_TOKEN),pollinations:Boolean(POLLINATIONS_API_KEY)}
    });
  }

  if (req.method !== "POST" || req.url !== "/render") {
    return json(res, 404, {ok:false,error:"Not found"});
  }

  if (RENDER_SECRET && req.headers["x-render-secret"] !== RENDER_SECRET) {
    return json(res, 401, {ok:false,error:"Unauthorized"});
  }

  try {
    const body = await readBody(req);
    const result = await render(body);
    return json(res, 200, result);
  } catch (e) {
    console.error("[RENDERER]", e);
    return json(res, 500, {
      ok:false,
      error:String(e?.message || e),
      code:e?.code || null
    });
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log("[RENDERER] listening on " + PORT);
});
