import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import ffmpegPath from "ffmpeg-static";

const execFileAsync = promisify(execFile);
const FFMPEG = process.env.FFMPEG_PATH || ffmpegPath || "ffmpeg";
const POLL = "https://gen.pollinations.ai/image/";
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || process.env.POLLINATIONS_KEY || "";

type RenderInput={prompt:string;voice?:string;webhook?:string};

function err(stage:string,message:string,extra:Record<string,unknown>={}) {
  const e=new Error(message) as Error & {stage?:string;details?:unknown};
  e.stage=stage; e.details=extra; return e;
}

function scenePrompts(prompt:string) {
  return Array.from({length:7},(_,i)=>(
    `${prompt}. Scene ${i+1} of 7. Cinematic vertical 9:16 composition, consistent character/world, no text, social-video visual.`
  ));
}

async function fetchImage(prompt:string, file:string) {
  const query=new URLSearchParams({
    width:"1080",
    height:"1920",
    nologo:"true"
  });
  if (POLLINATIONS_API_KEY) query.set("key",POLLINATIONS_API_KEY);
  const url=POLL+encodeURIComponent(prompt)+"?"+query.toString();
  const headers:Record<string,string>={Accept:"image/*"};
  if (POLLINATIONS_API_KEY) headers.Authorization="Bearer "+POLLINATIONS_API_KEY;
  let res=await fetch(url,{headers});

  // Pollinations current gateway can return 401 even when a key is configured.
  // Fall back to the legacy image endpoint so rendering can continue.
  if(res.status===401){
    const legacyUrl="https://image.pollinations.ai/prompt/"+encodeURIComponent(prompt)+"?width=1080&height=1920&nologo=true&model=flux";
    res=await fetch(legacyUrl,{headers:{Accept:"image/*"}});
    if(!res.ok) throw err("scene-generation","Scene image HTTP "+res.status,{url:legacyUrl,status:res.status,primaryStatus:401});
  }
  if(!res.ok) throw err("scene-generation","Scene image HTTP "+res.status,{url,status:res.status});
  const buf=Buffer.from(await res.arrayBuffer());
  if(!buf.length) throw err("scene-generation","Scene image was empty",{url});
  await fs.writeFile(file,buf);
  return {file,bytes:buf.length,url};
}

async function makeConcatList(files:string[],listFile:string) {
  const lines=files.map(f=>`file '${f.replace(/'/g,"'\\''")}'`).join("\n");
  await fs.writeFile(listFile,lines);
}

async function runFfmpeg(args:string[]) {
  try { return await execFileAsync(FFMPEG,args,{timeout:55000,maxBuffer:4*1024*1024}); }
  catch(e:any) {
    throw err("ffmpeg",e?.stderr || e?.message || "FFmpeg failed",{
      code:e?.code,stdout:e?.stdout,stderr:e?.stderr,
      hint:e?.code==="ENOENT" ? "No FFmpeg binary is available. Set FFMPEG_PATH to a runtime-provided FFmpeg binary." : undefined
    });
  }
}

async function makeVideo(images:string[],out:string) {
  const dir=path.dirname(out), list=path.join(dir,"concat.txt");
  const normalized:string[]=[];
  for(let i=0;i<images.length;i++){
    const f=path.join(dir,`scene-${i}.jpg`);
    await runFfmpeg(["-y","-i",images[i],"-vf","scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920","-q:v","3",f]);
    normalized.push(f);
  }
  await makeConcatList(normalized,list);
  await runFfmpeg(["-y","-f","concat","-safe","0","-i",list,"-vf","format=yuv420p","-c:v","libx264","-preset","veryfast","-r","30","-t","21",out]);
  const stat=await fs.stat(out);
  if(stat.size<1000) throw err("ffmpeg","FFmpeg produced an empty/invalid MP4",{bytes:stat.size});
  return {file:out,bytes:stat.size};
}

async function makeSilentAudioVideo(video:string,out:string) {
  await runFfmpeg(["-y","-i",video,"-f","lavfi","-i","anullsrc=r=48000:cl=stereo","-shortest","-c:v","copy","-c:a","aac","-b:a","128k",out]);
  return out;
}

export async function renderContent(input:RenderInput) {
  const root=await fs.mkdtemp(path.join(os.tmpdir(),"rapsometeddy-media-"));
  const traceId=createHash("sha256").update(root+Date.now()).digest("hex").slice(0,12);
  const images:string[]=[]; const stages:any[]=[];
  try {
    stages.push({stage:"scene-generation",status:"started"});
    for(let i=0;i<7;i++) {
      const result=await fetchImage(scenePrompts(input.prompt)[i],path.join(root,`raw-${i}.png`));
      images.push(result.file);
    }
    stages[0]={stage:"scene-generation",status:"ok",count:7};

    stages.push({stage:"background-renderer",status:"started"});
    const video=path.join(root,"visuals.mp4");
    await makeVideo(images,video);
    stages[1]={stage:"background-renderer",status:"ok"};

    stages.push({stage:"ffmpeg",status:"started"});
    const final=path.join(root,"final.mp4");
    try {
      await makeSilentAudioVideo(video,final);
      stages[2]={stage:"ffmpeg",status:"ok",audio:"silent-diagnostic"};
    } catch(e:any) {
      stages[2]={stage:"ffmpeg",status:"failed",error:{stage:e.stage,message:e.message,details:e.details}};
      throw e;
    }

    return {traceId,finalPath:final,stages,voiceover:{status:"not-requested",note:"Pipeline reports audio errors instead of silently falling back."}};
  } catch(e:any) {
    console.error("[MEDIA_PIPELINE]",JSON.stringify({traceId,stage:e.stage||"unknown",message:e.message,details:e.details,stages}));
    throw e;
  }
}
