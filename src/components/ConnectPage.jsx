import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";
import { LS } from "../systems/storage";

const INDUSTRIES = [
  "Tech / Software","Finance / Fintech","Real Estate","E-Commerce",
  "Health / Wellness","Education","Sustainability","Creative / Media",
  "Food & Hospitality","Manufacturing","Other",
];
const SEEKING = {
  Investor:["Startups to fund","Co-investors","Deal flow","Advisory roles"],
  Inventor:["Funding / Investment","Technical co-founder","Mentorship","Early customers"],
};
const INVESTMENT_RANGES=["Under £10k","£10k–£50k","£50k–£250k","£250k–£1M","£1M+"];
const STAGES=["Pre-idea","Pre-seed","Seed","Series A","Series B+","Any stage"];
const BUSINESS_STAGES=["Idea stage","Prototype built","MVP / Beta","Revenue generating","Scaling"];
const FUNDING_NEEDED=["Under £10k","£10k–£50k","£50k–£250k","£250k–£1M","£1M+"];

const DEMO_PROFILES=[
  {id:"d1",role:"Investor",name:"Marcus T.",firstName:"Marcus",lastName:"T.",industry:"Finance / Fintech",title:"Angel investor — Series A+",description:"Backed 14 startups across fintech and SaaS. Looking for founders who can articulate a clear path to profitability within 24 months. I write cheques from £25k to £500k.",seeking:"Startups to fund",emoji:"💼",tags:["Fintech","SaaS","B2B"],investmentRange:"£50k–£250k",stages:["Seed","Series A"]},
  {id:"d2",role:"Inventor",name:"Priya S.",firstName:"Priya",lastName:"S.",industry:"Health / Wellness",title:"Building AI diagnostics for rural healthcare",description:"Former NHS doctor. I've built a prototype that reduces diagnostic wait times by 70% using phone camera + ML. Seeking seed funding and a technical co-founder for the AI layer.",seeking:"Funding / Investment",emoji:"🩺",tags:["HealthTech","AI","Social Impact"],businessStage:"Prototype built",fundingNeeded:"£250k–£1M"},
  {id:"d3",role:"Investor",name:"James O.",firstName:"James",lastName:"O.",industry:"Real Estate",title:"PropTech & Real estate fund manager",description:"Managing a £2M property fund. Actively looking for PropTech founders who are digitising the rental market or commercial leasing. Deal size: £50k–£300k equity.",seeking:"Deal flow",emoji:"🏗️",tags:["PropTech","Real Estate","SaaS"],investmentRange:"£50k–£250k",stages:["Pre-seed","Seed"]},
  {id:"d4",role:"Inventor",name:"Keanu D.",firstName:"Keanu",lastName:"D.",industry:"E-Commerce",title:"Wealth education platform for young adults",description:"Built and scaled a financial literacy app to 10k users in 3 months. Looking for a strategic investor who understands consumer EdTech and can open doors to brand partnerships.",seeking:"Funding / Investment",emoji:"📱",tags:["EdTech","Consumer","Mobile"],businessStage:"Revenue generating",fundingNeeded:"£50k–£250k"},
  {id:"d5",role:"Investor",name:"Sofia R.",firstName:"Sofia",lastName:"R.",industry:"Sustainability",title:"Climate-tech VC partner",description:"Partner at a climate-focused fund. We invest pre-seed to Series A in founders tackling carbon, energy, and food systems. Strong network in EU & UK regulatory space.",seeking:"Startups to fund",emoji:"🌱",tags:["Climate","DeepTech","Impact"],investmentRange:"£250k–£1M",stages:["Pre-seed","Seed","Series A"]},
  {id:"d6",role:"Inventor",name:"Alex M.",firstName:"Alex",lastName:"M.",industry:"Creative / Media",title:"Creator economy infrastructure",description:"Ex-YouTube engineer. Building the financial layer for creators — instant payouts, tax automation, and business accounts. £180k revenue in beta. Looking for Series A lead.",seeking:"Funding / Investment",emoji:"🎬",tags:["Creator Economy","Fintech","B2C"],businessStage:"Revenue generating",fundingNeeded:"£1M+"},
];

function ProfileAvatar({profile,size=36,t}){
  if(!profile)return null;
  const ac=profile.role==="Investor"?"#50c878":"#4a9eff";
  const initials=([profile.firstName||"",profile.lastName||""].map(s=>s?.[0]||"").join("").toUpperCase())||(profile.name?.[0]||"?").toUpperCase();
  return(
    <div style={{width:size,height:size,borderRadius:"50%",background:`linear-gradient(135deg,${ac},${ac}99)`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`2px solid ${ac}44`,boxShadow:`0 2px 8px ${ac}30`}}>
      <span style={{color:"#fff",fontSize:size*0.38,fontWeight:800,fontFamily:"Georgia,serif",lineHeight:1}}>{initials}</span>
    </div>
  );
}

function RolePicker({t,play,onPick}){
  const[selected,setSelected]=useState(null);
  const roles=[
    {role:"Inventor",emoji:"💡",color:"#4a9eff",headline:"I'm an Inventor",sub:"I'm building something and I need the right people — funding, co-founders, or mentors.",traits:["Building a product or idea","Seeking investment","Looking for co-founders","Need mentorship"]},
    {role:"Investor",emoji:"💼",color:"#50c878",headline:"I'm an Investor",sub:"I have capital and experience and I'm looking for great founders or deal flow.",traits:["Have capital to deploy","Looking for startups","Offering advisory","Want deal flow"]},
  ];
  const handlePick=(role)=>{
    if(selected)return;
    play?.("tap");
    setSelected(role);
    setTimeout(()=>onPick(role),480);
  };
  return(
    <div style={{minHeight:"100%",background:t.skin,display:"flex",flexDirection:"column",padding:"0 20px",paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
      <style>{`
        @keyframes rp-fade-up{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes rp-card-in{from{opacity:0;transform:translateY(28px) scale(0.96)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes rp-arrow-l{0%,100%{transform:translateX(0);opacity:.7}50%{transform:translateX(-5px);opacity:1}}
        @keyframes rp-arrow-r{0%,100%{transform:translateX(0);opacity:.7}50%{transform:translateX(5px);opacity:1}}
      `}</style>
      <div style={{paddingTop:52,marginBottom:32,animation:"rp-fade-up .5s ease both"}}>
        <p style={{margin:"0 0 6px",fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:t.green}}>Investors &amp; Inventors</p>
        <h1 style={{margin:"0 0 10px",fontSize:28,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif",lineHeight:1.2}}>Who are you?</h1>
        <p style={{margin:0,fontSize:14,color:t.muted,lineHeight:1.7}}>Choose your role to build your networking profile. You only do this once.</p>
      </div>
      <div style={{display:"flex",gap:14,alignItems:"stretch",marginBottom:24}}>
        {roles.map((r,idx)=>{
          const isPicked=selected===r.role;
          const isOther=selected&&selected!==r.role;
          return(
            <button key={r.role} type="button" onClick={()=>handlePick(r.role)} style={{flex:1,background:isPicked?`linear-gradient(145deg,${r.color}22,${r.color}0a)`:t.white,border:isPicked?`2px solid ${r.color}`:`1.5px solid ${t.border}`,borderRadius:22,padding:"22px 14px 18px",cursor:"pointer",textAlign:"center",transition:"all .25s cubic-bezier(.22,1,.36,1)",opacity:isOther?.35:1,transform:isPicked?"scale(1.03)":"scale(1)",boxShadow:isPicked?`0 8px 28px ${r.color}30`:"0 2px 10px rgba(0,0,0,.06)",animation:`rp-card-in .5s cubic-bezier(.22,1,.36,1) ${idx*.1}s both`,display:"flex",flexDirection:"column",alignItems:"center",gap:9}}>
              <div style={{width:62,height:62,borderRadius:"50%",background:`${r.color}18`,border:`2px solid ${r.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0,boxShadow:isPicked?`0 4px 16px ${r.color}30`:"none",transition:"all .25s ease"}}>{r.emoji}</div>
              <p style={{margin:0,fontSize:15,fontWeight:800,color:isPicked?r.color:t.ink,fontFamily:"Georgia,serif",lineHeight:1.2}}>{r.headline}</p>
              <p style={{margin:0,fontSize:11,color:t.muted,lineHeight:1.6,textAlign:"center"}}>{r.sub}</p>
              <div style={{width:"100%",marginTop:2,display:"flex",flexDirection:"column",gap:5}}>
                {r.traits.map(tr=>(
                  <div key={tr} style={{display:"flex",alignItems:"center",gap:7}}>
                    <span style={{color:r.color,fontSize:11,fontWeight:800,flexShrink:0}}>✓</span>
                    <span style={{fontSize:11,color:t.mid,textAlign:"left",lineHeight:1.4}}>{tr}</span>
                  </div>
                ))}
              </div>
              <div style={{marginTop:6,width:"100%",padding:"11px 0",borderRadius:12,background:isPicked?r.color:`${r.color}15`,color:isPicked?"#fff":r.color,fontSize:13,fontWeight:800,transition:"all .22s ease",fontFamily:"Georgia,serif"}}>
                {isPicked?"✓ Selected":"Choose"}
              </div>
            </button>
          );
        })}
      </div>
      {!selected&&(
        <>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{flex:1,height:1,background:t.border}}/>
            <span style={{fontSize:11,color:t.muted,fontWeight:600,letterSpacing:.5,whiteSpace:"nowrap"}}>Tap a card to continue</span>
            <div style={{flex:1,height:1,background:t.border}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-around"}}>
            <span style={{fontSize:22,animation:"rp-arrow-l 1.3s ease-in-out infinite",color:"#4a9eff",fontWeight:700}}>←</span>
            <span style={{fontSize:22,animation:"rp-arrow-r 1.3s ease-in-out infinite",color:"#50c878",fontWeight:700}}>→</span>
          </div>
        </>
      )}
    </div>
  );
}

function NetworkingProfileForm({t,play,user,role,onSave,onBack}){
  const[firstName,setFirstName]=useState(()=>(user?.name||"").split(" ")[0]||"");
  const[lastName,setLastName]=useState(()=>(user?.name||"").split(" ").slice(1).join(" ")||"");
  const[title,setTitle]=useState("");
  const[description,setDescription]=useState("");
  const[industry,setIndustry]=useState("Tech / Software");
  const[seeking,setSeeking]=useState(SEEKING[role][0]);
  const[location,setLocation]=useState("");
  const[website,setWebsite]=useState("");
  const[investmentRange,setInvestmentRange]=useState(INVESTMENT_RANGES[2]);
  const[preferredStages,setPreferredStages]=useState([]);
  const[businessStage,setBusinessStage]=useState(BUSINESS_STAGES[0]);
  const[fundingNeeded,setFundingNeeded]=useState(FUNDING_NEEDED[1]);
  const[submitting,setSubmitting]=useState(false);

  const ac=role==="Investor"?"#50c878":"#4a9eff";
  const emoji=role==="Investor"?"💼":"💡";
  const inp={width:"100%",padding:"13px 16px",background:t.light,border:`1px solid ${t.border}`,borderRadius:12,color:t.ink,fontSize:14,fontFamily:"Georgia,serif",boxSizing:"border-box",outline:"none"};
  const canSubmit=title.trim()&&description.trim()&&firstName.trim();

  const toggleStage=s=>setPreferredStages(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);

  const handleSave=async()=>{
    if(!canSubmit||submitting)return;
    play?.("tap");setSubmitting(true);
    const fullName=[firstName.trim(),lastName.trim()].filter(Boolean).join(" ");
    const prof={role,name:fullName,firstName:firstName.trim(),lastName:lastName.trim(),title:title.trim(),description:description.trim(),industry,seeking,location:location.trim(),website:website.trim(),emoji,id:`local-${Date.now()}`,tags:[industry.split(" / ")[0]],...(role==="Investor"?{investmentRange,stages:preferredStages}:{businessStage,fundingNeeded})};
    if(isSupabaseConfigured&&user?.id){
      await supabase.from("pitches").insert({user_id:user.id,author_name:fullName,title:title.trim(),description:description.trim(),role,industry,looking_for:seeking}).catch(()=>{});
    }
    setSubmitting(false);
    onSave(prof);
  };

  const Chip=({label,active,onClick})=>(
    <button type="button" onClick={onClick} style={{padding:"8px 14px",borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",border:active?`2px solid ${ac}`:`1px solid ${t.border}`,background:active?`${ac}18`:t.light,color:active?ac:t.mid,transition:"all .15s ease"}}>{label}</button>
  );

  return(
    <div style={{paddingBottom:40}}>
      <style>{`@keyframes nf-in{from{opacity:0;transform:translateX(28px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:28,animation:"nf-in .4s ease both"}}>
        <button type="button" onClick={onBack} style={{background:"none",border:"none",color:t.muted,cursor:"pointer",padding:"4px 8px 4px 0",display:"flex",alignItems:"center"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{width:46,height:46,borderRadius:14,background:`${ac}18`,border:`2px solid ${ac}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{emoji}</div>
        <div>
          <h2 style={{margin:0,fontSize:20,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>Networking Information</h2>
          <p style={{margin:0,fontSize:12,color:ac,fontWeight:700}}>{role} Profile</p>
        </div>
      </div>

      <div style={{display:"grid",gap:16}}>
        {/* Name */}
        <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
          <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>Your Name</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>FIRST NAME</label>
              <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="First" style={inp} maxLength={40}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>LAST NAME</label>
              <input value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Last" style={inp} maxLength={40}/>
            </div>
          </div>
        </div>

        {/* Headline + Industry */}
        <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
          <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>{role==="Investor"?"Investment Focus":"Your Venture"}</p>
          <div style={{display:"grid",gap:12}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>{role==="Investor"?"HEADLINE / THESIS":"HEADLINE"}</label>
              <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={role==="Investor"?"e.g. Angel investor — fintech & SaaS":"e.g. Building AI for healthcare"} style={inp} maxLength={100}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>INDUSTRY</label>
              <select value={industry} onChange={e=>setIndustry(e.target.value)} style={{...inp,cursor:"pointer"}}>
                {INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Role-specific */}
        {role==="Investor"?(
          <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
            <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>Investment Details</p>
            <div style={{display:"grid",gap:14}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:8,letterSpacing:.8}}>TYPICAL CHEQUE SIZE</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{INVESTMENT_RANGES.map(r=><Chip key={r} label={r} active={investmentRange===r} onClick={()=>setInvestmentRange(r)}/>)}</div>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:8,letterSpacing:.8}}>PREFERRED STAGES</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{STAGES.map(s=><Chip key={s} label={s} active={preferredStages.includes(s)} onClick={()=>toggleStage(s)}/>)}</div>
              </div>
            </div>
          </div>
        ):(
          <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
            <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>Venture Details</p>
            <div style={{display:"grid",gap:14}}>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:8,letterSpacing:.8}}>STAGE OF YOUR BUSINESS</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{BUSINESS_STAGES.map(s=><Chip key={s} label={s} active={businessStage===s} onClick={()=>setBusinessStage(s)}/>)}</div>
              </div>
              <div>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:8,letterSpacing:.8}}>FUNDING NEEDED</label>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{FUNDING_NEEDED.map(f=><Chip key={f} label={f} active={fundingNeeded===f} onClick={()=>setFundingNeeded(f)}/>)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Pitch */}
        <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
          <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>{role==="Investor"?"Your Investment Pitch":"Your Venture Pitch"}</p>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>{role==="Investor"?"INVESTMENT THESIS":"WHAT ARE YOU BUILDING?"}</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder={role==="Investor"?"What's your investment thesis? What traction do you look for? What sectors excite you?":"What are you building? What problem does it solve? What's your traction so far?"} rows={5} maxLength={500} style={{...inp,resize:"none",lineHeight:1.7}}/>
          <p style={{margin:"4px 0 0",fontSize:11,color:description.length>450?"#e85555":t.muted,textAlign:"right",fontWeight:description.length>450?700:400}}>{description.length}/500</p>
        </div>

        {/* Seeking */}
        <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
          <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>I'm Looking For</p>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{(SEEKING[role]||[]).map(opt=><Chip key={opt} label={opt} active={seeking===opt} onClick={()=>setSeeking(opt)}/>)}</div>
        </div>

        {/* Optional */}
        <div style={{background:t.white,border:`1px solid ${t.border}`,borderRadius:16,padding:"18px 16px"}}>
          <p style={{margin:"0 0 14px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>Optional Details</p>
          <div style={{display:"grid",gap:12}}>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>LOCATION</label>
              <input value={location} onChange={e=>setLocation(e.target.value)} placeholder="e.g. London, UK" style={inp} maxLength={60}/>
            </div>
            <div>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:.8}}>WEBSITE / LINKEDIN</label>
              <input value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..." style={inp} maxLength={120} inputMode="url"/>
            </div>
          </div>
        </div>

        <button type="button" onClick={handleSave} disabled={submitting||!canSubmit} style={{width:"100%",padding:"17px",background:canSubmit?ac:t.border,border:"none",borderRadius:14,color:"#fff",fontSize:16,fontWeight:800,cursor:canSubmit?"pointer":"not-allowed",fontFamily:"Georgia,serif",transition:"all .2s ease",boxShadow:canSubmit?`0 6px 20px ${ac}40`:"none"}}>
          {submitting?"Saving...":"Save Profile →"}
        </button>
      </div>
    </div>
  );
}

function SwipeCard({profile,onSave,onPass,t}){
  const[offset,setOffset]=useState(0);
  const[exiting,setExiting]=useState(null);
  const dragStart=useRef(null);
  const dragging=useRef(false);
  const ac=profile.role==="Investor"?"#50c878":"#4a9eff";
  const saveOpacity=Math.min(Math.max(offset,0)/90,1);
  const passOpacity=Math.min(Math.max(-offset,0)/90,1);
  const initials=([profile.firstName||"",profile.lastName||""].map(s=>s?.[0]||"").join("").toUpperCase())||(profile.name?.[0]||"?").toUpperCase();

  const fly=useCallback((dir)=>{
    dragging.current=false;
    setExiting(dir);
    setOffset(dir==="save"?520:-520);
    setTimeout(()=>{if(dir==="save")onSave(profile);else onPass(profile);},380);
  },[profile,onSave,onPass]);

  const onTouchStart=e=>{dragStart.current=e.touches[0].clientX;dragging.current=true;};
  const onTouchMove=e=>{if(dragging.current)setOffset(e.touches[0].clientX-dragStart.current);};
  const onTouchEnd=()=>{if(!dragging.current)return;dragging.current=false;if(offset>90)fly("save");else if(offset<-90)fly("pass");else setOffset(0);};
  const onMouseDown=e=>{dragStart.current=e.clientX;dragging.current=true;};
  const onMouseMove=e=>{if(dragging.current)setOffset(e.clientX-dragStart.current);};
  const onMouseUp=()=>{if(!dragging.current)return;dragging.current=false;if(offset>90)fly("save");else if(offset<-90)fly("pass");else setOffset(0);};

  return(
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      style={{position:"absolute",inset:0,background:t.white,border:`1.5px solid ${t.border}`,borderRadius:26,padding:"26px 22px 22px",cursor:dragging.current?"grabbing":"grab",transform:`translateX(${offset}px) rotate(${offset*.065}deg)`,transition:dragging.current?"none":exiting?"transform .38s cubic-bezier(.4,0,.8,.4),opacity .3s ease":"transform .44s cubic-bezier(.22,1,.36,1)",opacity:exiting?0:1,display:"flex",flexDirection:"column",boxShadow:"0 10px 40px rgba(0,0,0,.28),0 2px 8px rgba(0,0,0,.15)",zIndex:10,userSelect:"none",WebkitUserSelect:"none",willChange:"transform",touchAction:"pan-y"}}>
      {/* SAVE stamp */}
      <div style={{position:"absolute",inset:0,borderRadius:26,pointerEvents:"none",background:"linear-gradient(to right,rgba(80,200,120,.18),transparent 65%)",opacity:saveOpacity,display:"flex",alignItems:"flex-start",padding:"26px 22px"}}>
        <div style={{background:"#50c878",color:"#fff",fontWeight:900,fontSize:16,letterSpacing:3,padding:"8px 18px",borderRadius:10,border:"2.5px solid #50c878",transform:"rotate(-8deg)",boxShadow:"0 4px 16px rgba(80,200,120,.5)",opacity:saveOpacity}}>SAVE</div>
      </div>
      {/* PASS stamp */}
      <div style={{position:"absolute",inset:0,borderRadius:26,pointerEvents:"none",background:"linear-gradient(to left,rgba(229,72,77,.18),transparent 65%)",opacity:passOpacity,display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:"26px 22px"}}>
        <div style={{background:"#e5484d",color:"#fff",fontWeight:900,fontSize:16,letterSpacing:3,padding:"8px 18px",borderRadius:10,border:"2.5px solid #e5484d",transform:"rotate(8deg)",boxShadow:"0 4px 16px rgba(229,72,77,.5)",opacity:passOpacity}}>PASS</div>
      </div>

      {/* Avatar + name */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
        <div style={{width:60,height:60,borderRadius:"50%",background:`linear-gradient(135deg,${ac},${ac}88)`,border:`2.5px solid ${ac}55`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#fff",fontFamily:"Georgia,serif",flexShrink:0,boxShadow:`0 4px 16px ${ac}30`}}>
          {initials}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
            <p style={{margin:0,fontSize:18,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif",lineHeight:1.1}}>{profile.name}</p>
            <span style={{background:`${ac}22`,color:ac,fontSize:9,fontWeight:700,letterSpacing:2,padding:"3px 9px",borderRadius:20,textTransform:"uppercase",border:`1px solid ${ac}44`,whiteSpace:"nowrap"}}>{profile.role}</span>
          </div>
          <p style={{margin:0,fontSize:12,color:t.muted}}>{profile.industry}</p>
          {profile.location&&<p style={{margin:"2px 0 0",fontSize:11,color:t.muted}}>📍 {profile.location}</p>}
        </div>
      </div>

      <h3 style={{margin:"0 0 12px",fontSize:17,fontWeight:700,color:t.ink,fontFamily:"Georgia,serif",lineHeight:1.35}}>{profile.title}</h3>
      <p style={{margin:"0 0 18px",fontSize:13.5,lineHeight:1.8,color:t.mid,flex:1}}>{profile.description}</p>

      {profile.role==="Investor"&&profile.investmentRange&&(
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <span style={{background:`${ac}0f`,border:`1px solid ${ac}33`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:ac}}>💰 {profile.investmentRange}</span>
          {(profile.stages||[]).slice(0,2).map(s=><span key={s} style={{background:t.light,border:`1px solid ${t.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,color:t.muted}}>{s}</span>)}
        </div>
      )}
      {profile.role==="Inventor"&&profile.businessStage&&(
        <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
          <span style={{background:`${ac}0f`,border:`1px solid ${ac}33`,borderRadius:20,padding:"4px 12px",fontSize:11,fontWeight:700,color:ac}}>🚀 {profile.businessStage}</span>
          {profile.fundingNeeded&&<span style={{background:t.light,border:`1px solid ${t.border}`,borderRadius:20,padding:"4px 10px",fontSize:11,fontWeight:600,color:t.muted}}>Seeking {profile.fundingNeeded}</span>}
        </div>
      )}

      {profile.tags&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>{profile.tags.map(tag=><span key={tag} style={{background:t.light,color:t.muted,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,border:`1px solid ${t.border}`}}>{tag}</span>)}</div>}

      <div style={{background:`${ac}0f`,border:`1px solid ${ac}33`,borderRadius:12,padding:"10px 14px"}}>
        <p style={{margin:"0 0 2px",fontSize:9,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:ac}}>Seeking</p>
        <p style={{margin:0,fontSize:13,color:t.mid,fontWeight:600}}>{profile.seeking}</p>
      </div>
    </div>
  );
}

function SwipeDeck({profiles,t,play}){
  const[stack,setStack]=useState([...profiles]);
  const[saved,setSaved]=useState([]);
  const[toast,setToast]=useState(null);

  const handleSave=useCallback((p)=>{play?.("tap");setSaved(s=>[...s,p]);setStack(s=>s.slice(1));setToast("saved");setTimeout(()=>setToast(null),1600);},[play]);
  const handlePass=useCallback(()=>{play?.("tap");setStack(s=>s.slice(1));setToast("passed");setTimeout(()=>setToast(null),1000);},[play]);

  const current=stack[0],next=stack[1],third=stack[2];

  if(!current)return(
    <div style={{textAlign:"center",padding:"48px 24px"}}>
      <div style={{fontSize:52,marginBottom:16}}>🎉</div>
      <h3 style={{margin:"0 0 8px",fontSize:22,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>You&apos;ve seen everyone</h3>
      <p style={{margin:"0 0 24px",fontSize:14,color:t.muted,lineHeight:1.7}}>{saved.length>0?`You saved ${saved.length} profile${saved.length>1?"s":""}. Check back soon for new members.`:"No matches yet — check back for new profiles."}</p>
      {saved.length>0&&(
        <div style={{textAlign:"left",background:t.white,border:`1px solid ${t.border}`,borderRadius:16,overflow:"hidden"}}>
          <p style={{margin:0,padding:"14px 16px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted,borderBottom:`1px solid ${t.border}`}}>Saved profiles</p>
          {saved.map(p=><div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:`1px solid ${t.border}`}}><ProfileAvatar profile={p} size={36} t={t}/><div><p style={{margin:0,fontSize:13,fontWeight:700,color:t.ink}}>{p.name}</p><p style={{margin:0,fontSize:11,color:t.muted}}>{p.role} · {p.industry}</p></div></div>)}
        </div>
      )}
    </div>
  );

  return(
    <div>
      <style>{`
        @keyframes sd-arrow-l{0%,100%{transform:translateX(0);opacity:.7}50%{transform:translateX(-5px);opacity:1}}
        @keyframes sd-arrow-r{0%,100%{transform:translateX(0);opacity:.7}50%{transform:translateX(5px);opacity:1}}
        @keyframes sd-toast{from{opacity:0;transform:translateX(-50%) scale(.88) translateY(8px)}to{opacity:1;transform:translateX(-50%) scale(1) translateY(0)}}
      `}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"0 4px"}}>
        <p style={{margin:0,fontSize:11,color:t.muted}}>{stack.length} profile{stack.length!==1?"s":""} remaining</p>
        {saved.length>0&&<span style={{background:`${t.green}22`,color:t.green,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${t.green}44`}}>{saved.length} saved ✓</span>}
      </div>

      <div style={{position:"relative",height:"min(500px, 52svh)",marginBottom:28}}>
        {third&&<div style={{position:"absolute",inset:0,background:t.white,border:`1px solid ${t.border}`,borderRadius:26,transform:"scale(.90) translateY(32px)",opacity:.22,pointerEvents:"none",zIndex:1}}/>}
        {next&&<div style={{position:"absolute",inset:0,background:t.white,border:`1px solid ${t.border}`,borderRadius:26,transform:"scale(.955) translateY(16px)",opacity:.48,pointerEvents:"none",zIndex:2}}/>}
        <SwipeCard key={current.id} profile={current} onSave={handleSave} onPass={handlePass} t={t}/>
      </div>

      {/* Bigger coloured buttons */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:32}}>
        <button type="button" onClick={handlePass} title="Pass"
          style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#fff5f5,#fff)",border:"2px solid rgba(229,72,77,.35)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:28,color:"#e5484d",boxShadow:"0 6px 22px rgba(229,72,77,.22)",transition:"all .2s ease"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.09)";e.currentTarget.style.boxShadow="0 8px 30px rgba(229,72,77,.38)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 6px 22px rgba(229,72,77,.22)";}}>✕</button>
        <button type="button" onClick={()=>handleSave(current)} title="Save"
          style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#50c878,#3aad60)",border:"2px solid rgba(80,200,120,.35)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:30,color:"#fff",boxShadow:"0 6px 22px rgba(80,200,120,.40)",transition:"all .2s ease"}}
          onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.09)";e.currentTarget.style.boxShadow="0 8px 30px rgba(80,200,120,.55)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 6px 22px rgba(80,200,120,.40)";}}>♥</button>
      </div>

      {/* Animated hint arrows */}
      <p style={{textAlign:"center",marginTop:16,fontSize:13,color:t.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
        <span style={{animation:"sd-arrow-l 1.4s ease-in-out infinite",color:"#e5484d",fontWeight:800,fontSize:18}}>←</span>
        <span style={{letterSpacing:.5}}>pass · swipe · save</span>
        <span style={{animation:"sd-arrow-r 1.4s ease-in-out infinite",color:"#50c878",fontWeight:800,fontSize:18}}>→</span>
      </p>

      {toast&&<div style={{position:"fixed",bottom:"calc(96px + env(safe-area-inset-bottom,0px))",left:"50%",transform:"translateX(-50%)",background:toast==="saved"?"#50c878":"#e5484d",color:"#fff",padding:"12px 28px",borderRadius:14,fontSize:14,fontWeight:800,boxShadow:toast==="saved"?"0 8px 24px rgba(80,200,120,.45)":"0 8px 24px rgba(229,72,77,.35)",zIndex:90,whiteSpace:"nowrap",animation:"sd-toast .3s cubic-bezier(.22,1,.36,1) both"}}>{toast==="saved"?"♥ Saved!":"✕ Passed"}</div>}
    </div>
  );
}

export function ConnectPage({t,user,play}){
  const profileKey=`net_profile_${user?.id||user?.email||"guest"}`;
  const[myProfile,setMyProfile]=useState(()=>LS.get(profileKey,null));
  const[stage,setStage]=useState(()=>LS.get(profileKey,null)?"discover":"role_pick");
  const[pickedRole,setPickedRole]=useState(null);
  const[filterRole,setFilterRole]=useState("All");
  const[searchQuery,setSearchQuery]=useState("");
  const[profiles,setProfiles]=useState([]);
  const[loading,setLoading]=useState(true);
  const[deckKey,setDeckKey]=useState(0);
  const[showMyProfile,setShowMyProfile]=useState(false);

  const fetchProfiles=useCallback(async()=>{
    setLoading(true);
    if(!isSupabaseConfigured){setProfiles(DEMO_PROFILES);setLoading(false);return;}
    const{data}=await supabase.from("pitches").select("*").order("created_at",{ascending:false}).limit(50);
    setProfiles(data?.length?data.map(d=>({id:d.id,role:d.role,name:d.author_name,firstName:d.author_name?.split(" ")[0]||"",lastName:d.author_name?.split(" ").slice(1).join(" ")||"",industry:d.industry,title:d.title,description:d.description,seeking:d.looking_for,emoji:d.role==="Investor"?"💼":"💡",tags:[d.industry?.split(" / ")[0]]})):DEMO_PROFILES);
    setLoading(false);
  },[]);

  useEffect(()=>{fetchProfiles();},[fetchProfiles]);

  const handleRolePick=role=>{setPickedRole(role);setStage("create_profile");};
  const handleProfileSave=profile=>{setMyProfile(profile);LS.set(profileKey,profile);setStage("discover");play?.("ok");};

  const filteredProfiles=profiles
    .filter(p=>!myProfile||p.id!==myProfile.id)
    .filter(p=>filterRole==="All"||p.role===filterRole)
    .filter(p=>{
      if(!searchQuery.trim())return true;
      const q=searchQuery.toLowerCase();
      return p.name?.toLowerCase().includes(q)||p.industry?.toLowerCase().includes(q)||p.title?.toLowerCase().includes(q)||p.description?.toLowerCase().includes(q)||p.role?.toLowerCase().includes(q);
    });

  if(stage==="role_pick")return<RolePicker t={t} play={play} onPick={handleRolePick}/>;
  if(stage==="create_profile")return(<div style={{padding:"32px 20px",maxWidth:480,margin:"0 auto"}}><NetworkingProfileForm t={t} play={play} user={user} role={pickedRole} onSave={handleProfileSave} onBack={()=>setStage("role_pick")}/></div>);

  return(
    <div data-page-tag="#connect" style={{padding:"28px 20px calc(96px + env(safe-area-inset-bottom,0px)) 20px",maxWidth:480,margin:"0 auto",boxSizing:"border-box"}}>
      <style>{`@keyframes cp-fade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div style={{marginBottom:20}}>
        <p style={{margin:"0 0 4px",fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:t.green}}>Networking</p>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <h2 style={{margin:"0 0 4px",fontSize:26,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>Investors &amp; Inventors</h2>
            <p style={{margin:0,fontSize:13,color:t.muted,lineHeight:1.6}}>Swipe to find your next deal or co-founder.</p>
          </div>
          {myProfile&&(
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,flexShrink:0}}>
              <button type="button" onClick={()=>{play?.("tap");setShowMyProfile(v=>!v);}} style={{background:"none",border:"none",cursor:"pointer",padding:4}} title="Your networking profile">
                <ProfileAvatar profile={myProfile} size={46} t={t}/>
              </button>
              <button type="button" onClick={()=>{if(window.confirm("Reset your networking profile? This cannot be undone.")){setMyProfile(null);setShowMyProfile(false);LS.set(profileKey,null);setStage("role_pick");play?.("back");}}} style={{background:"none",border:`1px solid ${t.border}`,borderRadius:8,cursor:"pointer",padding:"3px 8px",fontSize:9,fontWeight:700,color:t.muted,fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>Reset</button>
            </div>
          )}
        </div>
      </div>

      {/* My profile mini card */}
      {myProfile&&showMyProfile&&(
        <div style={{background:t.white,border:`1.5px solid ${myProfile.role==="Investor"?"#50c87855":"#4a9eff55"}`,borderRadius:16,padding:"14px 16px",marginBottom:16,animation:"cp-fade .3s ease both"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <ProfileAvatar profile={myProfile} size={40} t={t}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                <p style={{margin:0,fontSize:14,fontWeight:700,color:t.ink,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{myProfile.name}</p>
                <span style={{background:myProfile.role==="Investor"?"#50c87822":"#4a9eff22",color:myProfile.role==="Investor"?"#50c878":"#4a9eff",fontSize:9,fontWeight:700,letterSpacing:2,padding:"2px 8px",borderRadius:20,textTransform:"uppercase",border:`1px solid ${myProfile.role==="Investor"?"#50c87844":"#4a9eff44"}`,whiteSpace:"nowrap",flexShrink:0}}>{myProfile.role}</span>
              </div>
              <p style={{margin:0,fontSize:11,color:t.muted,lineHeight:1.4,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{myProfile.title}</p>
            </div>
            <span style={{background:`${t.green}22`,color:t.green,fontSize:9,fontWeight:700,letterSpacing:2,padding:"3px 10px",borderRadius:20,border:`1px solid ${t.green}44`,flexShrink:0}}>LIVE</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{position:"relative",marginBottom:14}}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
          <circle cx="6" cy="6" r="4.5" stroke={t.muted} strokeWidth="1.5"/>
          <line x1="9.5" y1="9.5" x2="13" y2="13" stroke={t.muted} strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
        <input type="text" value={searchQuery} onChange={e=>{setSearchQuery(e.target.value);setDeckKey(k=>k+1);}} placeholder="Search investors & inventors…"
          style={{width:"100%",padding:"11px 36px 11px 34px",background:t.light,border:`1px solid ${t.border}`,borderRadius:20,color:t.ink,fontSize:13,fontFamily:"Georgia,serif",boxSizing:"border-box",outline:"none"}}/>
        {searchQuery&&<button type="button" onClick={()=>{setSearchQuery("");setDeckKey(k=>k+1);}} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:t.muted,fontSize:18,width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}}>×</button>}
      </div>

      {/* Filters */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {["All","Investor","Inventor"].map(f=>(
          <button key={f} type="button" onClick={()=>{play?.("tap");setFilterRole(f);setDeckKey(k=>k+1);}}
            style={{padding:"8px 18px",borderRadius:20,fontSize:12,fontWeight:700,border:filterRole===f?`2px solid ${t.green}`:`1px solid ${t.border}`,background:filterRole===f?`${t.green}18`:t.white,color:filterRole===f?t.green:t.muted,cursor:"pointer",transition:"all .18s ease",fontFamily:"Georgia,serif"}}>{f}</button>
        ))}
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:60,color:t.muted}}>
          <div style={{fontSize:28,marginBottom:12,animation:"life-spin-slow 2s linear infinite",display:"inline-block"}}>⟳</div>
          <p style={{margin:0,fontSize:14}}>Loading profiles...</p>
        </div>
      ):(
        <SwipeDeck key={`${deckKey}-${filterRole}-${searchQuery}`} profiles={filteredProfiles} t={t} play={play}/>
      )}

      {!isSupabaseConfigured&&<p style={{textAlign:"center",marginTop:16,fontSize:11,color:t.muted,fontStyle:"italic"}}>Demo profiles shown · Real networking requires an account</p>}
    </div>
  );
}
