import { NextRequest, NextResponse } from "next/server";
import { renderContent } from "../../../lib/media-pipeline";

export const runtime="nodejs";
export const maxDuration=60;

const TG="https://api.telegram.org/bot";
async function tg(token:string,method:string,body:any){
  const r=await fetch(TG+token+"/"+method,{
    method:"POST",
    headers:{"content-type":"application/json"},
    body:JSON.stringify(body)
  });
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
      "Create a cinematic Rapsometeddy tech, AI and entrepreneurship image set.";

    await tg(token,"sendMessage",{
      chat_id:chatId,
      text:"🖼️ Image pipeline started: generating 7 scenes."
    });

    try{
      const result=await renderContent({prompt,telegramChatId:chatId});
      await tg(token,"sendMessage",{
        chat_id:chatId,
        text:"✅ Image pipeline finished.\n🖼️ Scenes sent: "+(result.stages[0]?.count || 0)+"/7\n🔎 Trace: "+result.traceId
      });
      return NextResponse.json({ok:true,traceId:result.traceId,stages:result.stages});
    }catch(e:any){
      const detail=e.details?JSON.stringify(e.details).slice(0,1800):"";
      await tg(token,"sendMessage",{
        chat_id:chatId,
        text:"❌ Image pipeline failed.\nStage: "+(e.stage||"unknown")+"\nError: "+String(e.message||e).slice(0,1500)+(detail?"\nDetails: "+detail:"")
      });
      return NextResponse.json({ok:false,error:{stage:e.stage||"unknown",message:e.message,details:e.details}},{status:500});
    }
  }catch(e:any){
    console.error("[TELEGRAM_WEBHOOK_FATAL]",e);
    return NextResponse.json({ok:false,error:String(e?.message||e)},{status:500});
  }
}
