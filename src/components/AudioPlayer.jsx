import { useState, useRef, useEffect } from "react";
import { C } from "../systems/theme";

export function AudioPlayer({title,playSound}){
  const[playing,setPlaying]=useState(false);const[elapsed,setElapsed]=useState(0);const total=180;const ref=useRef(null);
  const toggle=()=>{playSound(playing?"back":"open");if(!playing){ref.current=setInterval(()=>setElapsed(e=>{if(e>=total){clearInterval(ref.current);setPlaying(false);return 0;}return e+1;}),1000);}else clearInterval(ref.current);setPlaying(!playing);};
  const reset=()=>{clearInterval(ref.current);setPlaying(false);setElapsed(0);};
  useEffect(()=>()=>clearInterval(ref.current),[]);
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;
  return(
    <div style={{marginTop:40,padding:24,background:C.light,border:`1px solid ${C.border}`,borderRadius:14}}>
      <p style={{margin:"0 0 8px",fontSize:10,color:C.muted,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase"}}>Audio Narration</p>
      <p style={{margin:"0 0 16px",fontSize:13,color:C.mid,fontStyle:"italic"}}>{title}</p>
      <div style={{height:5,background:C.border,borderRadius:4,marginBottom:10,cursor:"pointer"}} onClick={e=>{const r=e.currentTarget.getBoundingClientRect();setElapsed(Math.floor(((e.clientX-r.left)/r.width)*total));}}>
        <div style={{height:"100%",width:`${(elapsed/total)*100}%`,background:C.green,borderRadius:4,transition:"width 0.5s linear"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,color:C.muted}}>{fmt(elapsed)}</span><span style={{fontSize:11,color:C.muted}}>{fmt(total)}</span>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={toggle} aria-label={playing ? "Pause audio narration" : "Play audio narration"} style={{flex:1,background:C.green,border:"none",borderRadius:10,padding:"13px",color:C.white,fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif"}}>{playing?"⏸  Pause":"▶  Play AI Narration"}</button>
        <button onClick={reset} aria-label="Restart audio narration" style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,padding:"13px 18px",color:C.mid,fontSize:16,cursor:"pointer"}}>↺</button>
      </div>
    </div>
  );
}
