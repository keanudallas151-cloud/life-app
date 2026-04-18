import { useState, useEffect, useCallback, useRef } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

// ─── Constants ───────────────────────────────────────────────────────────────
const INDUSTRIES = [
  "Tech / Software", "Finance / Fintech", "Real Estate", "E-Commerce",
  "Health / Wellness", "Education", "Sustainability", "Creative / Media",
  "Food & Hospitality", "Manufacturing", "Other",
];

const SEEKING = {
  Investor: ["Startups to fund", "Co-investors", "Deal flow", "Advisory roles"],
  Inventor: ["Funding / Investment", "Technical co-founder", "Mentorship", "Early customers"],
};

const DEMO_PROFILES = [
  { id:"d1", role:"Investor", name:"Marcus T.", industry:"Finance / Fintech", title:"Angel investor — Series A+", description:"Backed 14 startups across fintech and SaaS. Looking for founders who can articulate a clear path to profitability within 24 months. I write cheques from £25k to £500k.", seeking:"Startups to fund", emoji:"💼", tags:["Fintech","SaaS","B2B"] },
  { id:"d2", role:"Inventor", name:"Priya S.", industry:"Health / Wellness", title:"Building AI diagnostics for rural healthcare", description:"Former NHS doctor. I've built a prototype that reduces diagnostic wait times by 70% using phone camera + ML. Seeking seed funding and a technical co-founder for the AI layer.", seeking:"Funding / Investment", emoji:"🩺", tags:["HealthTech","AI","Social Impact"] },
  { id:"d3", role:"Investor", name:"James O.", industry:"Real Estate", title:"PropTech & Real estate fund manager", description:"Managing a £2M property fund. Actively looking for PropTech founders who are digitising the rental market or commercial leasing. Deal size: £50k–£300k equity.", seeking:"Deal flow", emoji:"🏗️", tags:["PropTech","Real Estate","SaaS"] },
  { id:"d4", role:"Inventor", name:"Keanu D.", industry:"E-Commerce", title:"Wealth education platform for young adults", description:"Built and scaled a financial literacy app to 10k users in 3 months. Looking for a strategic investor who understands consumer EdTech and can open doors to brand partnerships.", seeking:"Funding / Investment", emoji:"📱", tags:["EdTech","Consumer","Mobile"] },
  { id:"d5", role:"Investor", name:"Sofia R.", industry:"Sustainability", title:"Climate-tech VC partner", description:"Partner at a climate-focused fund. We invest pre-seed to Series A in founders tackling carbon, energy, and food systems. Strong network in EU & UK regulatory space.", seeking:"Startups to fund", emoji:"🌱", tags:["Climate","DeepTech","Impact"] },
  { id:"d6", role:"Inventor", name:"Alex M.", industry:"Creative / Media", title:"Creator economy infrastructure", description:"Ex-YouTube engineer. Building the financial layer for creators — instant payouts, tax automation, and business accounts. £180k revenue in beta. Looking for Series A lead.", seeking:"Funding / Investment", emoji:"🎬", tags:["Creator Economy","Fintech","B2C"] },
];

// ─── Single swipe card ────────────────────────────────────────────────────────
function SwipeCard({ profile, onSave, onPass, t }) {
  const [offset, setOffset] = useState(0);
  const [exiting, setExiting] = useState(null);
  const dragStart = useRef(null);
  const dragging = useRef(false);

  const fly = useCallback((dir) => {
    dragging.current = false;
    setExiting(dir);
    setOffset(dir === "save" ? 500 : -500);
    setTimeout(() => { if (dir === "save") onSave(profile); else onPass(profile); }, 360);
  }, [profile, onSave, onPass]);

  const onTouchStart = (e) => { dragStart.current = e.touches[0].clientX; dragging.current = true; };
  const onTouchMove = (e) => { if (dragging.current) setOffset(e.touches[0].clientX - dragStart.current); };
  const onTouchEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (offset > 80) fly("save"); else if (offset < -80) fly("pass"); else setOffset(0);
  };
  const onMouseDown = (e) => { dragStart.current = e.clientX; dragging.current = true; };
  const onMouseMove = (e) => { if (dragging.current) setOffset(e.clientX - dragStart.current); };
  const onMouseUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (offset > 80) fly("save"); else if (offset < -80) fly("pass"); else setOffset(0);
  };

  const rotation = offset * 0.07;
  const accentColor = profile.role === "Investor" ? "#50c878" : "#4a9eff";

  return (
    <div
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      style={{
        position:"absolute", inset:0, background:t.white, border:`1.5px solid ${t.border}`,
        borderRadius:24, padding:"28px 24px 24px",
        cursor: dragging.current ? "grabbing" : "grab",
        transform:`translateX(${offset}px) rotate(${rotation}deg)`,
        transition: dragging.current ? "none" : exiting
          ? "transform 0.36s cubic-bezier(0.4,0,0.8,0.4),opacity 0.3s ease"
          : "transform 0.42s cubic-bezier(0.22,1,0.36,1)",
        opacity: exiting ? 0 : 1,
        display:"flex", flexDirection:"column",
        boxShadow:"0 8px 32px rgba(0,0,0,0.35),0 2px 8px rgba(0,0,0,0.2)",
        zIndex:10, userSelect:"none", WebkitUserSelect:"none", willChange:"transform",
      }}
    >
      {offset > 20 && (
        <div style={{position:"absolute",inset:0,borderRadius:24,pointerEvents:"none",
          background:"linear-gradient(to right,rgba(80,200,120,0.14),transparent 60%)",
          display:"flex",alignItems:"flex-start",padding:"28px 24px"}}>
          <div style={{background:"#50c878",color:"#fff",fontWeight:800,fontSize:13,letterSpacing:2,
            padding:"6px 14px",borderRadius:8,border:"2px solid #50c878",
            opacity:Math.min(offset/80,1),transform:"rotate(-8deg)"}}>SAVE</div>
        </div>
      )}
      {offset < -20 && (
        <div style={{position:"absolute",inset:0,borderRadius:24,pointerEvents:"none",
          background:"linear-gradient(to left,rgba(229,72,77,0.14),transparent 60%)",
          display:"flex",alignItems:"flex-start",justifyContent:"flex-end",padding:"28px 24px"}}>
          <div style={{background:"#e5484d",color:"#fff",fontWeight:800,fontSize:13,letterSpacing:2,
            padding:"6px 14px",borderRadius:8,border:"2px solid #e5484d",
            opacity:Math.min(Math.abs(offset)/80,1),transform:"rotate(8deg)"}}>PASS</div>
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <div style={{width:56,height:56,borderRadius:18,background:`${accentColor}22`,
          border:`2px solid ${accentColor}44`,display:"flex",alignItems:"center",
          justifyContent:"center",fontSize:28,flexShrink:0}}>
          {profile.emoji || (profile.role==="Investor"?"💼":"💡")}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <p style={{margin:0,fontSize:17,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>{profile.name}</p>
            <span style={{background:`${accentColor}22`,color:accentColor,fontSize:9,fontWeight:700,
              letterSpacing:2,padding:"2px 8px",borderRadius:20,textTransform:"uppercase",
              border:`1px solid ${accentColor}44`,whiteSpace:"nowrap"}}>{profile.role}</span>
          </div>
          <p style={{margin:0,fontSize:12,color:t.muted}}>{profile.industry}</p>
        </div>
      </div>
      <h3 style={{margin:"0 0 12px",fontSize:18,fontWeight:700,color:t.ink,fontFamily:"Georgia,serif",lineHeight:1.3}}>{profile.title}</h3>
      <p style={{margin:"0 0 20px",fontSize:14,lineHeight:1.8,color:t.mid,flex:1}}>{profile.description}</p>
      {profile.tags && (
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:16}}>
          {profile.tags.map(tag=>(
            <span key={tag} style={{background:t.light,color:t.muted,fontSize:11,fontWeight:600,
              padding:"3px 10px",borderRadius:20,border:`1px solid ${t.border}`}}>{tag}</span>
          ))}
        </div>
      )}
      <div style={{background:`${accentColor}0f`,border:`1px solid ${accentColor}33`,borderRadius:12,padding:"10px 14px"}}>
        <p style={{margin:"0 0 2px",fontSize:9,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:accentColor}}>Seeking</p>
        <p style={{margin:0,fontSize:13,color:t.mid,fontWeight:600}}>{profile.seeking}</p>
      </div>
    </div>
  );
}

// ─── Swipe deck ───────────────────────────────────────────────────────────────
function SwipeDeck({ profiles, t, play }) {
  const [stack, setStack] = useState([...profiles]);
  const [saved, setSaved] = useState([]);
  const [toast, setToast] = useState(false);

  const handleSave = useCallback((p) => {
    play?.("tap");
    setSaved(s=>[...s,p]);
    setStack(s=>s.slice(1));
    setToast(true);
    setTimeout(()=>setToast(false),1800);
  },[play]);

  const handlePass = useCallback(() => {
    play?.("tap");
    setStack(s=>s.slice(1));
  },[play]);

  const current = stack[0];
  const next = stack[1];
  const third = stack[2];

  if (!current) return (
    <div style={{textAlign:"center",padding:"48px 24px"}}>
      <div style={{fontSize:52,marginBottom:16}}>🎉</div>
      <h3 style={{margin:"0 0 8px",fontSize:22,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>You've seen everyone</h3>
      <p style={{margin:"0 0 24px",fontSize:14,color:t.muted,lineHeight:1.7}}>
        {saved.length>0 ? `You saved ${saved.length} profile${saved.length>1?"s":""}. Check back soon.` : "No matches yet — check back for new profiles."}
      </p>
      {saved.length>0&&(
        <div style={{textAlign:"left",background:t.white,border:`1px solid ${t.border}`,borderRadius:16,overflow:"hidden"}}>
          <p style={{margin:0,padding:"14px 16px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted,borderBottom:`1px solid ${t.border}`}}>Saved profiles</p>
          {saved.map(p=>(
            <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:`1px solid ${t.border}`}}>
              <span style={{fontSize:22}}>{p.emoji||(p.role==="Investor"?"💼":"💡")}</span>
              <div>
                <p style={{margin:0,fontSize:13,fontWeight:700,color:t.ink}}>{p.name}</p>
                <p style={{margin:0,fontSize:11,color:t.muted}}>{p.role} · {p.industry}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{position:"relative"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,padding:"0 4px"}}>
        <p style={{margin:0,fontSize:11,color:t.muted}}>{stack.length} profile{stack.length!==1?"s":""} remaining</p>
        {saved.length>0&&<span style={{background:`${t.green}22`,color:t.green,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${t.green}44`}}>{saved.length} saved ✓</span>}
      </div>
      <div style={{position:"relative",height:470,marginBottom:24}}>
        {third&&<div style={{position:"absolute",inset:0,background:t.white,border:`1px solid ${t.border}`,borderRadius:24,transform:"scale(0.92) translateY(28px)",opacity:0.3,pointerEvents:"none",zIndex:1}}/>}
        {next&&<div style={{position:"absolute",inset:0,background:t.white,border:`1px solid ${t.border}`,borderRadius:24,transform:"scale(0.96) translateY(14px)",opacity:0.55,pointerEvents:"none",zIndex:2}}/>}
        <SwipeCard key={current.id} profile={current} onSave={handleSave} onPass={handlePass} t={t}/>
      </div>
      <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:24}}>
        <button type="button" onClick={()=>handlePass(current)} title="Pass"
          style={{width:58,height:58,borderRadius:"50%",background:t.white,border:`1.5px solid ${t.border}`,
            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:20,
            boxShadow:"0 4px 14px rgba(0,0,0,0.25)",transition:"all 0.2s ease"}}>✕</button>
        <button type="button" onClick={()=>handleSave(current)} title="Save"
          style={{width:58,height:58,borderRadius:"50%",background:t.green,border:`1.5px solid ${t.green}`,
            display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:22,color:"#fff",
            boxShadow:"0 4px 14px rgba(80,200,120,0.35)",transition:"all 0.2s ease"}}>♥</button>
      </div>
      <p style={{textAlign:"center",marginTop:12,fontSize:11,color:t.muted}}>
        <span style={{display:"inline-block",animation:"life-swipe-hint 1.6s ease-in-out infinite",marginRight:4}}>←</span>
        pass · swipe · save
        <span style={{display:"inline-block",animation:"life-swipe-hint 1.6s ease-in-out infinite reverse",marginLeft:4}}>→</span>
      </p>
      {toast&&<div style={{position:"fixed",bottom:100,left:"50%",transform:"translateX(-50%)",
        background:t.green,color:"#fff",padding:"12px 24px",borderRadius:12,fontSize:14,fontWeight:700,
        boxShadow:"0 8px 24px rgba(80,200,120,0.4)",zIndex:300,whiteSpace:"nowrap",
        animation:"life-badge-enter 0.3s cubic-bezier(0.22,1,0.36,1) both"}}>♥ Saved!</div>}
    </div>
  );
}

// ─── Profile creation ─────────────────────────────────────────────────────────
function CreateProfile({ t, play, user, onSave, onCancel }) {
  const [role, setRole] = useState(null);
  const [name, setName] = useState(user?.name||user?.email?.split("@")[0]||"");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("Tech / Software");
  const [seeking, setSeeking] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inp = {width:"100%",padding:"13px 16px",background:t.light,border:`1px solid ${t.border}`,
    borderRadius:12,color:t.ink,fontSize:14,fontFamily:"Georgia,serif",boxSizing:"border-box",outline:"none"};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!role||!title.trim()||!description.trim()) return;
    play?.("tap"); setSubmitting(true);
    if (isSupabaseConfigured&&user?.id) {
      await supabase.from("pitches").insert({
        user_id:user.id, author_name:name.trim(), title:title.trim(),
        description:description.trim(), role, industry, looking_for:seeking,
      });
    }
    onSave({role,name:name.trim(),title:title.trim(),description:description.trim(),industry,seeking,
      emoji:role==="Investor"?"💼":"💡", id:`local-${Date.now()}`,
      tags:[industry.split(" / ")[0]]});
    setSubmitting(false);
  };

  if (!role) return (
    <div style={{paddingBottom:32}}>
      <h3 style={{margin:"0 0 8px",fontSize:22,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>Who are you?</h3>
      <p style={{margin:"0 0 28px",fontSize:14,color:t.muted,lineHeight:1.7}}>Choose your role to create a profile.</p>
      <div style={{display:"grid",gap:14}}>
        {[{role:"Investor",emoji:"💼",title:"I'm an Investor",desc:"I have capital and I'm looking for startups or ideas worth backing.",color:"#50c878"},
          {role:"Inventor",emoji:"💡",title:"I'm an Inventor",desc:"I'm building something and I'm looking for the right people to scale it.",color:"#4a9eff"}]
          .map(({role:r,emoji,title:rt,desc,color})=>(
          <button key={r} type="button" onClick={()=>{play?.("tap");setRole(r);setSeeking(SEEKING[r][0]);}}
            style={{background:t.white,border:`1.5px solid ${t.border}`,borderRadius:20,padding:"24px 22px",
              textAlign:"left",cursor:"pointer",display:"flex",gap:18,alignItems:"flex-start",transition:"all 0.2s ease"}}>
            <span style={{width:52,height:52,borderRadius:16,flexShrink:0,background:`${color}18`,
              border:`2px solid ${color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{emoji}</span>
            <div>
              <p style={{margin:"0 0 6px",fontSize:17,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>{rt}</p>
              <p style={{margin:0,fontSize:13,color:t.muted,lineHeight:1.65}}>{desc}</p>
            </div>
          </button>
        ))}
      </div>
      <button type="button" onClick={onCancel} style={{marginTop:20,background:"none",border:"none",color:t.muted,fontSize:13,cursor:"pointer",width:"100%"}}>Cancel</button>
    </div>
  );

  const accentColor = role==="Investor"?"#50c878":"#4a9eff";
  return (
    <form onSubmit={handleSubmit} style={{paddingBottom:32}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button type="button" onClick={()=>setRole(null)} style={{background:"none",border:"none",color:t.muted,fontSize:18,cursor:"pointer",padding:"4px 8px 4px 0"}}>←</button>
        <div>
          <h3 style={{margin:0,fontSize:20,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>{role} Profile</h3>
          <p style={{margin:0,fontSize:12,color:t.muted}}>Tell the world what you're about.</p>
        </div>
      </div>
      <div style={{display:"grid",gap:14}}>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:1}}>YOUR NAME</label>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="How should people know you?" style={inp} maxLength={60}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:1}}>HEADLINE</label>
          <input value={title} onChange={e=>setTitle(e.target.value)}
            placeholder={role==="Investor"?"e.g. Angel investor — fintech & SaaS":"e.g. Building AI for healthcare diagnostics"}
            style={inp} maxLength={100}/>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:1}}>INDUSTRY</label>
          <select value={industry} onChange={e=>setIndustry(e.target.value)} style={{...inp,cursor:"pointer"}}>
            {INDUSTRIES.map(i=><option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:6,letterSpacing:1}}>YOUR PITCH</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)}
            placeholder={role==="Investor"?"What's your investment thesis? What traction do you look for?":"What are you building? What problem does it solve?"}
            rows={5} maxLength={500} style={{...inp,resize:"none",lineHeight:1.7}}/>
          <p style={{margin:"4px 0 0",fontSize:11,color:t.muted,textAlign:"right"}}>{description.length}/500</p>
        </div>
        <div>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:t.muted,marginBottom:8,letterSpacing:1}}>I'M SEEKING</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {(SEEKING[role]||[]).map(opt=>(
              <button type="button" key={opt} onClick={()=>setSeeking(opt)}
                style={{padding:"8px 16px",borderRadius:20,
                  border:seeking===opt?`2px solid ${accentColor}`:`1px solid ${t.border}`,
                  background:seeking===opt?`${accentColor}18`:t.light,
                  color:seeking===opt?accentColor:t.mid,
                  fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.18s ease"}}>{opt}</button>
            ))}
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:6}}>
          <button type="submit" disabled={submitting||!title.trim()||!description.trim()}
            style={{flex:1,padding:"15px",background:accentColor,border:"none",borderRadius:12,color:"#fff",
              fontSize:15,fontWeight:700,cursor:submitting?"not-allowed":"pointer",fontFamily:"Georgia,serif",
              opacity:submitting||!title.trim()||!description.trim()?0.55:1,transition:"opacity 0.2s ease"}}>
            {submitting?"Publishing...":"Publish Profile"}
          </button>
          <button type="button" onClick={onCancel}
            style={{padding:"15px 20px",background:t.light,border:`1px solid ${t.border}`,
              borderRadius:12,color:t.mid,fontSize:14,fontWeight:600,cursor:"pointer"}}>Cancel</button>
        </div>
      </div>
    </form>
  );
}

// ─── Main ConnectPage ─────────────────────────────────────────────────────────
export function ConnectPage({ t, user, play }) {
  const [view, setView] = useState("discover");
  const [filterRole, setFilterRole] = useState("All");
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState(null);
  const [deckKey, setDeckKey] = useState(0);

  const fetchProfiles = useCallback(async () => {
    if (!isSupabaseConfigured) { setProfiles(DEMO_PROFILES); setLoading(false); return; }
    const { data } = await supabase.from("pitches").select("*").order("created_at",{ascending:false}).limit(50);
    setProfiles(data?.length ? data.map(d=>({
      id:d.id, role:d.role, name:d.author_name, industry:d.industry,
      title:d.title, description:d.description, seeking:d.looking_for,
      emoji:d.role==="Investor"?"💼":"💡", tags:[d.industry?.split(" / ")[0]],
    })) : DEMO_PROFILES);
    setLoading(false);
  },[]);

  useEffect(()=>{fetchProfiles();},[fetchProfiles]);

  const filteredProfiles = (filterRole==="All" ? profiles : profiles.filter(p=>p.role===filterRole))
    .filter(p=>!myProfile||p.id!==myProfile.id);

  return (
    <div data-page-tag="#connect" style={{padding:"32px 20px",maxWidth:480,margin:"0 auto"}}>
      <div style={{marginBottom:24}}>
        <p style={{margin:"0 0 4px",fontSize:10,fontWeight:700,letterSpacing:3,textTransform:"uppercase",color:t.green}}>Networking</p>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12}}>
          <div>
            <h2 style={{margin:"0 0 4px",fontSize:26,fontWeight:800,color:t.ink,fontFamily:"Georgia,serif"}}>Investors &amp; Inventors</h2>
            <p style={{margin:0,fontSize:13,color:t.muted,lineHeight:1.6}}>Swipe to find your next deal or co-founder.</p>
          </div>
          <button type="button"
            onClick={()=>{play?.("tap");setView(v=>v==="create"?"discover":"create");}}
            style={{flexShrink:0,padding:"10px 16px",background:view==="create"?t.light:t.green,
              border:`1px solid ${view==="create"?t.border:t.green}`,borderRadius:12,
              color:view==="create"?t.mid:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",
              fontFamily:"Georgia,serif",whiteSpace:"nowrap"}}>
            {myProfile?"Edit Profile":view==="create"?"← Discover":"+ Your Profile"}
          </button>
        </div>
      </div>

      {myProfile&&view==="discover"&&(
        <div style={{display:"flex",alignItems:"center",gap:10,background:t.white,border:`1px solid ${t.border}`,
          borderRadius:12,padding:"10px 14px",marginBottom:20}}>
          <span style={{fontSize:20}}>{myProfile.role==="Investor"?"💼":"💡"}</span>
          <div style={{flex:1,minWidth:0}}>
            <p style={{margin:0,fontSize:13,fontWeight:700,color:t.ink}}>{myProfile.name}</p>
            <p style={{margin:0,fontSize:11,color:t.muted}}>{myProfile.role} · {myProfile.industry}</p>
          </div>
          <span style={{background:`${t.green}22`,color:t.green,fontSize:9,fontWeight:700,letterSpacing:2,
            padding:"2px 8px",borderRadius:20,border:`1px solid ${t.green}44`}}>LIVE</span>
        </div>
      )}

      {view==="create" ? (
        <CreateProfile t={t} play={play} user={user}
          onSave={(p)=>{ setMyProfile(p); setView("discover"); }}
          onCancel={()=>setView("discover")}/>
      ) : (
        <>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            {["All","Investor","Inventor"].map(f=>(
              <button key={f} type="button" onClick={()=>{play?.("tap");setFilterRole(f);setDeckKey(k=>k+1);}}
                style={{padding:"7px 18px",borderRadius:20,fontSize:12,fontWeight:700,
                  border:filterRole===f?`2px solid ${t.green}`:`1px solid ${t.border}`,
                  background:filterRole===f?`${t.green}18`:t.white,
                  color:filterRole===f?t.green:t.muted,cursor:"pointer",
                  transition:"all 0.18s ease",fontFamily:"Georgia,serif"}}>{f}</button>
            ))}
          </div>
          {loading ? (
            <div style={{textAlign:"center",padding:60,color:t.muted}}>
              <div style={{fontSize:28,marginBottom:12,animation:"life-spin-slow 2s linear infinite",display:"inline-block"}}>⟳</div>
              <p style={{margin:0,fontSize:14}}>Loading profiles...</p>
            </div>
          ) : (
            <SwipeDeck key={`${deckKey}-${filterRole}`} profiles={filteredProfiles} t={t} play={play}/>
          )}
          {!isSupabaseConfigured&&(
            <p style={{textAlign:"center",marginTop:16,fontSize:11,color:t.muted,fontStyle:"italic"}}>
              Demo profiles shown · Real networking requires an account
            </p>
          )}
        </>
      )}
    </div>
  );
}
