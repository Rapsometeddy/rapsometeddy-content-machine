import { NextRequest, NextResponse } from "next/server";
import { renderContent } from "../../../lib/media-pipeline";

export const runtime="nodejs";
export const maxDuration=60;

const TG="https://api.telegram.org/bot";
async function tg(token:string,method:string,body:any){
  const r=await fetch(TG+token+"/"+method,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
  const j=await r.json();
  if(!j.ok) throw new Error("Telegram "+method+" failed: "+JSON.stringify(j));
  return j;
}

export async function POST(req:NextRequest){
  const token=process.env.BOT_TOKEN;
  if(!token) return NextResponse.json({ok:false,error:"BOT_TOKEN missing"},{status:500});
  try{
    const update=await req.json();
    const msg=update?.message;
    if(!msg?.chat?.id) return NextResponse.json({ok:true,ignored:true});
    const chatId=msg.chat.id;
    const text=String(msg.text||"");
    const prompt=text.replace(/^\/(render|make)(@\w+)?\s*/i,"").trim() ||
      "Create a cinematic Rapsometeddy tech, AI and entrepreneurship short video.";
    await tg(token,"sendMessage",{chat_id:chatId,text:"🎬 Pipeline started: 7 scenes → renderer → FFmpeg. Audio failures will be reported explicitly."});
    try{
      const result=await renderContent({prompt});
      await tg(token,"sendMessage",{chat_id:chatId,text:
        "✅ Media pipeline finished.\n"+
        "🖼️ Scenes: "+result.stages.find((s:any)=>s.stage==="scene-generation")?.count+"/7\n"+
        "🎬 FFmpeg: "+(result.stages.find((s:any)=>s.stage==="ffmpeg")?.status||"unknown")+"\n"+
        "🔎 Trace: "+result.traceId
      });
      // Telegram file upload is intentionally isolated here; next iteration can use the returned finalPath
      // with multipart upload when the runtime/storage strategy is selected.
      return NextResponse.json({ok:true,traceId:result.traceId,stages:result.stages});
    }catch(e:any){
      const detail=e.details?JSON.stringify(e.details).slice(0,1800):"";
      await tg(token,"sendMessage",{chat_id:chatId,text:
        "❌ Media pipeline failed.\n"+
        "Stage: "+(e.stage||"unknown")+"\n"+
        "Error: "+String(e.message||e).slice(0,1500)+"\n"+
        (detail?"Details: "+detail+"\n":"")+"\nNo silent fallback was used."
      });
      return NextResponse.json({ok:false,error:{stage:e.stage||"unknown",message:e.message,details:e.details}},{status:500});
    }
  }catch(e:any){
    console.error("[TELEGRAM_WEBHOOK_FATAL]",e);
    return NextResponse.json({ok:false,error:String(e?.message||e)},{status:500});
  }
}
