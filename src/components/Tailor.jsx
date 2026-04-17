import { useState } from "react";
import { C } from "../systems/theme";
import { CONTENT_TAGS, buildProfile, computeEssentialScore } from "../data/tailoring";
import { CONTENT } from "../data/content";

export function TailorIntro({userName,onExplore,onTailor,t:theme}){
  const t = theme || C;
  return(
    <div style={{minHeight:"100svh",paddingBottom:"env(safe-area-inset-bottom, 0px)",background:t.skin,display:"flex",flexDirection:"column",fontFamily:"Georgia,serif"}}>
      <div style={{padding:"52px 32px 0",textAlign:"center"}}>
        <p style={{margin:"0 0 8px",fontSize:10,fontWeight:700,letterSpacing:3.5,textTransform:"uppercase",color:t.muted}}>Welcome{userName?`, ${userName.split(" ")[0]}`:""}</p>
        <h1 style={{margin:"0 0 0",fontSize:26,fontWeight:800,color:t.ink,lineHeight:1.2,letterSpacing:-0.5}}>Tailored Self-Development</h1>
      </div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"36px 28px"}}>
        <div style={{maxWidth:420,width:"100%"}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
            <div style={{width:80,height:80,borderRadius:"24px",background:`linear-gradient(145deg,#6FBE77,#4a8c5c)`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 8px 28px rgba(74,140,92,0.28)"}}>
              <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
              </svg>
            </div>
          </div>
          <p style={{margin:"0 0 8px",fontSize:16,color:t.mid,lineHeight:1.85,textAlign:"center",fontFamily:"Georgia,serif"}}>
            To best personalise your experience and help you grow, we would like to ask you a few questions so you do not waste valuable time learning on a subject that doesn't align with your values and goals.
          </p>
          <p style={{margin:"20px 0 36px",fontSize:13,color:"#b0a898",fontStyle:"italic",textAlign:"center",lineHeight:1.7,padding:"0 12px"}}>
            "Knowledge is the first step onto becoming successful, action is the second and final step."
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <button onClick={onTailor}
              style={{width:"100%",background:"#6FBE77",border:"none",borderRadius:14,padding:"18px",color:t.white,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif",boxShadow:"0 4px 16px rgba(111,190,119,0.35)"}}>
              Let's Get Tailoring! →
            </button>
            <button onClick={onExplore}
              style={{width:"100%",background:t.red,border:"none",borderRadius:14,padding:"18px",color:t.white,fontSize:16,fontWeight:600,cursor:"pointer",fontFamily:"Georgia,serif"}}>
              I'm an Explorer!
            </button>
          </div>
        </div>
      </div>
      <p style={{textAlign:"center",padding:"0 0 24px",fontSize:10,color:t.muted,fontStyle:"italic"}}>You can retake this at any time from your profile.</p>
    </div>
  );
}

export function TailorQuestions({onComplete,onBack,t:theme}){
  const t = theme || C;
  const[step,setStep]=useState(0);
  const[answers,setAnswers]=useState({
    goals:null,motivation:null,finance_level:null,english_level:null,learning_style:null,
    age_group:null,biggest_challenge:null,reading_frequency:null,accountability_style:null,content_depth:null,
    time:40,life_areas:[]
  });
  const[animDir,setAnimDir]=useState("in");

  const questions=[
    {id:"goals",label:"What is your biggest dream or goal right now?",multi:false,
      opts:["Generate Income","Start A Business","Improving Mindset","Learning","Freedom","To Be Wiser"]},
    {id:"motivation",label:"What drives you to seek knowledge?",multi:false,
      opts:["Financial Freedom","Self-Improvement","Curiosity","Solve Personal Problems","Self-Discipline And Structure"]},
    {id:"age_group",label:"Which age group best describes you?",multi:false,
      opts:["13-17","18-24","25-34","35-44","45+"]},
    {id:"biggest_challenge",label:"What is the biggest challenge holding you back?",multi:false,
      opts:["Lack of motivation","Not enough money","No clear direction","Bad habits / discipline","Social anxiety / confidence","Time management"]},
    {id:"finance_level",label:"How would you rate your financial literacy?",multi:false,
      opts:["No understanding (Beginner)","Basic understanding","Intermediate","Advanced","Expert Understanding"]},
    {id:"english_level",label:"How comfortable are you reading English?",multi:false,
      opts:["Beginner","Fluent","Shakespeare Level"]},
    {id:"reading_frequency",label:"How often do you read or study on your own?",multi:false,
      opts:["Never / rarely","A few times a month","Weekly","Daily reader"]},
    {id:"learning_style",label:"How do you learn best?",multi:false,
      opts:["Reading","Videos","Interactive/Hands-on","Audio"]},
    {id:"accountability_style",label:"What keeps you accountable?",multi:false,
      opts:["I prefer solo learning","I like tracking my progress","I need a community","I work best with a mentor"]},
    {id:"content_depth",label:"How deep do you want the content to go?",multi:false,
      opts:["Quick tips & summaries","Balanced — some detail","Deep dives & full breakdowns","I want everything available"]},
    {id:"time",label:"How much time per week will you dedicate to learning?",multi:false,opts:null,slider:true},
    {id:"life_areas",label:"Which areas of your life need the most work?",multi:true,
      opts:["Finance","Psychology/Mindset","Discipline","Social Skills","Health","Business/Entrepreneurship","Communication","Productivity"]},
  ];

  const q=questions[step];
  const total=questions.length;

  const timeLabels=[
    {v:0,label:"30 min a day"},
    {v:25,label:"Once a day"},
    {v:50,label:"Twice a day"},
    {v:75,label:"Every evening"},
    {v:100,label:"Everyday Nonstop 😤"},
  ];
  const getNearestLabel=(val)=>{
    let closest=timeLabels[0];
    timeLabels.forEach(tl=>{if(Math.abs(tl.v-val)<Math.abs(closest.v-val))closest=tl;});
    return closest.label;
  };

  const isAnswered=()=>{
    if(q.slider)return true;
    if(q.multi)return answers[q.id].length>0;
    return answers[q.id]!==null;
  };

  const goNext=()=>{
    if(!isAnswered())return;
    if(step<total-1){setAnimDir("out");setTimeout(()=>{setStep(s=>s+1);setAnimDir("in");},180);}
    else{onComplete(buildProfile(answers));}
  };
  const goPrev=()=>{
    if(step===0){onBack();return;}
    setAnimDir("out");setTimeout(()=>{setStep(s=>s-1);setAnimDir("in");},180);
  };

  const toggleOpt=(id,val,multi)=>{
    if(multi){
      setAnswers(a=>{const arr=a[id];return{...a,[id]:arr.includes(val)?arr.filter(x=>x!==val):[...arr,val]};});
    }else{
      setAnswers(a=>({...a,[id]:val}));
    }
  };

  const pct=Math.round(((step+1)/total)*100);

  return(
    <div data-page-tag="#tailor_questions" style={{minHeight:"100svh",paddingBottom:"env(safe-area-inset-bottom, 0px)",background:t.skin,display:"flex",flexDirection:"column",fontFamily:"Georgia,serif"}}>
      {/* Header bar */}
      <div style={{background:t.white,borderBottom:`1px solid ${t.border}`,padding:"16px 20px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <button onClick={goPrev} style={{background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:13,padding:0,fontFamily:"Georgia,serif",display:"flex",alignItems:"center",gap:4}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <span style={{fontSize:11,color:t.muted,fontWeight:600,letterSpacing:1}}>{step+1} of {total}</span>
          <div style={{width:40}}/>
        </div>
        <div style={{height:4,background:t.light,borderRadius:4,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:t.green,borderRadius:4,transition:"width 0.35s ease"}}/>
        </div>
      </div>

      {/* Question body */}
      <div style={{flex:1,padding:"28px 22px 20px",maxWidth:520,margin:"0 auto",width:"100%",boxSizing:"border-box",
        opacity:animDir==="out"?0:1,transform:animDir==="out"?"translateX(16px)":"translateX(0)",transition:"opacity 0.18s,transform 0.18s"}}>
        <p style={{margin:"0 0 4px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.green}}>Question {step+1}</p>
        <h2 style={{margin:"0 0 24px",fontSize:20,fontWeight:800,color:t.ink,lineHeight:1.35,letterSpacing:-0.3}}>{q.label}</h2>

        {/* Slider question */}
        {q.slider&&(
          <div style={{padding:"4px 0 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:6}}>
              {timeLabels.map(tl=>(
                <span key={tl.v} style={{fontSize:10,color:Math.abs(tl.v-answers.time)<14?t.green:t.muted,fontWeight:Math.abs(tl.v-answers.time)<14?700:400,fontFamily:"Georgia,serif",textAlign:"center",maxWidth:70,lineHeight:1.3}}>{tl.label}</span>
              ))}
            </div>
            <div style={{position:"relative",height:44,display:"flex",alignItems:"center"}}>
              <div style={{position:"absolute",left:0,right:0,height:5,background:t.border,borderRadius:4}}>
                <div style={{height:"100%",width:`${answers.time}%`,background:t.green,borderRadius:4}}/>
              </div>
              <input type="range" min="0" max="100" value={answers.time}
                onChange={e=>setAnswers(a=>({...a,time:Number(e.target.value)}))}
                style={{position:"absolute",left:0,right:0,width:"100%",opacity:0,height:44,cursor:"pointer",zIndex:2}}/>
              <div style={{position:"absolute",left:`calc(${answers.time}% - 14px)`,width:28,height:28,borderRadius:"50%",background:t.green,boxShadow:`0 2px 10px rgba(74,140,92,0.45)`,border:`3px solid ${t.white}`,pointerEvents:"none",transition:"left 0.05s"}}/>
            </div>
            <p style={{marginTop:16,textAlign:"center",fontSize:14,fontWeight:700,color:t.green,fontFamily:"Georgia,serif"}}>{getNearestLabel(answers.time)}</p>
          </div>
        )}

        {/* Options grid */}
        {!q.slider&&q.opts&&(
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {q.opts.map(opt=>{
              const sel=q.multi?answers[q.id].includes(opt):answers[q.id]===opt;
              return(
                <button key={opt} onClick={()=>toggleOpt(q.id,opt,q.multi)}
                  style={{
                    background:sel?t.green:t.white,
                    border:`1.5px solid ${sel?t.green:t.border}`,
                    borderRadius:14,
                    padding:"14px 18px",
                    fontSize:14,
                    fontWeight:sel?700:500,
                    color:sel?t.white:t.mid,
                    cursor:"pointer",
                    fontFamily:"Georgia,serif",
                    textAlign:"left",
                    display:"flex",
                    alignItems:"center",
                    gap:10,
                    transition:"background 0.15s, border-color 0.15s",
                  }}>
                  {/* Check / radio indicator */}
                  <span style={{
                    width:20,height:20,borderRadius:q.multi?4:"50%",flexShrink:0,
                    border:sel?`2px solid #fff`:`2px solid ${t.border}`,
                    background:sel?t.green:t.white,
                    display:"flex",alignItems:"center",justifyContent:"center",
                  }}>
                    {sel&&<svg width="12" height="12" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
        {q.multi&&<p style={{margin:"12px 0 0",fontSize:11,color:t.muted,fontStyle:"italic"}}>Select all that apply.</p>}
      </div>

      {/* Footer */}
      <div style={{padding:"14px 22px 32px",maxWidth:520,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>
        <button onClick={goNext} disabled={!isAnswered()}
          style={{width:"100%",background:isAnswered()?t.green:t.light,border:"none",borderRadius:14,padding:"17px",color:isAnswered()?t.white:t.muted,fontSize:16,fontWeight:700,cursor:isAnswered()?"pointer":"default",fontFamily:"Georgia,serif",transition:"background 0.2s, color 0.2s"}}>
          {step<total-1?"Continue →":"Build My Plan ✦"}
        </button>
      </div>
    </div>
  );
}

export function TailorResult({profile,userName,onContinue,t:theme}){
  const t = theme || C;
  if(!profile)return null;
  const first=userName?userName.split(" ")[0]:"Explorer";

  const catMeta={
    finance:{label:"Finance",col:"#6FBE77",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>},
    mindset:{label:"Mindset",col:"#7B9ED9",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2a4.5 4.5 0 000 9"/><path d="M14.5 2a4.5 4.5 0 010 9"/><path d="M5 11a4 4 0 004 4v5h6v-5a4 4 0 004-4"/></svg>},
    psychology:{label:"Psychology",col:"#C48BB8",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>},
    business:{label:"Business",col:"#b8975a",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>},
    philosophy:{label:"Philosophy",col:"#9E8FA8",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/></svg>},
    practical:{label:"Practical Skills",col:"#7AB899",icon:<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>},
  };

  const topCats=profile.topCats||[];
  const scores=profile.scores||{};

  const starters=Object.entries(CONTENT_TAGS)
    .map(([key,tags])=>{
      const score=computeEssentialScore(key,profile)||0;
      const diffMatch=tags.includes(profile.difficulty);
      return{key,score:score+(diffMatch?0.25:0)};
    })
    .sort((a,b)=>b.score-a.score)
    .slice(0,3)
    .map(x=>x.key);

  return(
    <div style={{minHeight:"100svh",paddingBottom:"env(safe-area-inset-bottom, 0px)",background:t.skin,fontFamily:"Georgia,serif",overflowY:"auto"}}>
      <div style={{background:`linear-gradient(160deg,#6FBE77 0%,#4a8c5c 100%)`,padding:"max(40px, env(safe-area-inset-top, 0px)) 28px 36px",textAlign:"center",position:"relative"}}>
        <div style={{width:56,height:56,borderRadius:"18px",background:"rgba(255,255,255,0.18)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
        </div>
        <h1 style={{margin:"0 0 8px",fontSize:24,fontWeight:800,color:"white",letterSpacing:-0.4}}>Your Plan is Ready, {first}.</h1>
        <p style={{margin:0,fontSize:14,color:"rgba(255,255,255,0.82)",fontStyle:"italic",lineHeight:1.6}}>Personalised to your goals, pace, and level.</p>
      </div>
      <div style={{padding:"28px 24px",maxWidth:520,margin:"0 auto"}}>
        <p style={{fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted,margin:"0 0 14px"}}>Your Focus Areas</p>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:28}}>
          {topCats.filter(c=>catMeta[c]).map(cat=>{
            const meta=catMeta[cat];
            const pct=Math.round((scores[cat]||0)*100);
            return(
              <div key={cat} style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,color:meta.col}}>{meta.icon}<span style={{fontSize:14,fontWeight:700,color:t.ink}}>{meta.label}</span></div>
                  <span style={{fontSize:13,fontWeight:700,color:meta.col}}>{pct}%</span>
                </div>
                <div style={{height:5,background:t.light,borderRadius:4}}>
                  <div style={{height:"100%",width:`${pct}%`,background:meta.col,borderRadius:4}}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",marginBottom:28,display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:40,height:40,borderRadius:10,background:t.greenLt,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4a8c5c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>
          </div>
          <div>
            <p style={{margin:"0 0 2px",fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:t.muted}}>Starting Level</p>
            <p style={{margin:0,fontSize:16,fontWeight:700,color:t.ink,textTransform:"capitalize"}}>{profile.difficulty}</p>
          </div>
        </div>
        <p style={{fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted,margin:"0 0 12px"}}>Where to Begin</p>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:32}}>
          {starters.map((key,i)=>{
            const node=CONTENT[key];if(!node)return null;
            const pct=Math.round((computeEssentialScore(key,profile)||0)*100);
            return(
              <div key={key} style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"#6FBE77",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:t.white,fontSize:12,fontWeight:700}}>{i+1}</span>
                </div>
                <div style={{flex:1}}>
                  <p style={{margin:"0 0 2px",fontSize:14,fontWeight:600,color:t.ink}}>{node.label}</p>
                  <p style={{margin:0,fontSize:11,color:t.muted,fontStyle:"italic"}}>{node.content?.level}</p>
                </div>
                <span style={{fontSize:11,fontWeight:700,color:"#6FBE77",background:"#eaf3ec",padding:"3px 10px",borderRadius:20}}>{pct}% match</span>
              </div>
            );
          })}
        </div>
        <button onClick={onContinue}
          style={{width:"100%",background:"#6FBE77",border:"none",borderRadius:14,padding:"18px",color:t.white,fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif",boxShadow:"0 4px 16px rgba(111,190,119,0.32)"}}>
          Start Learning →
        </button>
        <p style={{textAlign:"center",margin:"14px 0 0",fontSize:12,color:t.muted,fontStyle:"italic"}}>Your personalised experience is now active.</p>
      </div>
    </div>
  );
}
