import { C } from "../systems/theme";

export function Bar({label,value,max,color,prefix="",suffix="",t=C}){
  const pct=max>0?Math.round((value/max)*100):0;
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12,color:t.mid,fontFamily:"Georgia,serif"}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700,color:color||t.green,fontFamily:"Georgia,serif"}}>{prefix}{typeof value==="number"?value.toLocaleString():value}{suffix}</span>
      </div>
      <div style={{height:10,background:t.light,borderRadius:20}}>
        <div style={{height:"100%",width:`${pct}%`,background:color||t.green,borderRadius:20}}/>
      </div>
    </div>
  );
}

export function LineChart({data,color,xLabel,t=C}){
  if(!data||data.length===0)return null;
  const vals=data.map(d=>d.v);
  const mx=Math.max(...vals);const mn=Math.min(...vals);const rng=mx-mn||1;
  const W=280,H=120,P=8;
  const divisor=data.length>1?data.length-1:1;
  const pts=data.map((d,i)=>({x:P+(i/divisor)*(W-P*2),y:H-P-((d.v-mn)/rng)*(H-P*2)}));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const fill=path+` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return(
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
        <defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color||t.green} stopOpacity="0.25"/><stop offset="100%" stopColor={color||t.green} stopOpacity="0.02"/></linearGradient></defs>
        <path d={fill} fill="url(#lcg)"/>
        <path d={path} fill="none" stroke={color||t.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color||t.green}/>)}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>{data.map((d,i)=><span key={i} style={{fontSize:10,color:t.muted,fontFamily:"Georgia,serif"}}>{d.l}</span>)}</div>
      {xLabel&&<p style={{fontSize:10,color:t.muted,textAlign:"center",margin:"6px 0 0",fontStyle:"italic"}}>{xLabel}</p>}
    </div>
  );
}

export function ChartCard({title,children,t=C}){
  return(
    <div style={{margin:"32px 0",padding:"22px",background:t.white,border:`1px solid ${t.border}`,borderRadius:14}}>
      <p style={{margin:"0 0 18px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:t.muted}}>{title}</p>
      {children}
    </div>
  );
}

const FINANCE_CHARTS={
  fractional:(t)=>(<ChartCard title="The Money Multiplier in Action" t={t}><Bar t={t} label="Your deposit" value={1000} max={10000} color={t.red} prefix="$"/><Bar t={t} label="Bank lends out (90%)" value={900} max={10000} color="#d4834a" prefix="$"/><Bar t={t} label="Re-deposited & lent again" value={810} max={10000} color="#6FBE77" prefix="$"/><Bar t={t} label="Total money supply created" value={10000} max={10000} color={t.green} prefix="$"/><p style={{fontSize:11,color:t.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>10% reserve ratio → 10x money multiplier</p></ChartCard>),
  inflation:(t)=>(<ChartCard title="Purchasing Power of $10,000 Over Time" t={t}><LineChart t={t} color={t.red} data={[{l:"Today",v:10000},{l:"5yr",v:8587},{l:"10yr",v:7374},{l:"20yr",v:5438},{l:"30yr",v:4010}]} xLabel="Cash loses half its value every ~23 years at 3% inflation"/></ChartCard>),
  personal_finance:(t)=>(<ChartCard title="The Cost of Waiting to Invest" t={t}><Bar t={t} label="Start at 25 (40 years)" value={1746} max={1746} color={t.green} prefix="$" suffix="k"/><Bar t={t} label="Start at 35 (30 years)" value={745} max={1746} color="#d4834a" prefix="$" suffix="k"/><Bar t={t} label="Start at 45 (20 years)" value={294} max={1746} color={t.red} prefix="$" suffix="k"/><p style={{fontSize:11,color:t.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>$500/month at 8% — starting 10 years later costs over $1M</p></ChartCard>),
  trading:(t)=>(<ChartCard title="Day Trader Profitability Over Time" t={t}><Bar t={t} label="Profitable after 1 year" value={20} max={100} color={t.green} suffix="%"/><Bar t={t} label="Profitable after 3 years" value={7} max={100} color="#d4834a" suffix="%"/><Bar t={t} label="Profitable after 5 years" value={3} max={100} color={t.red} suffix="%"/><p style={{fontSize:11,color:t.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>97% of people who trade for 5+ years are not profitable</p></ChartCard>),
  billionaire_tax:(t)=>(<ChartCard title="Effective Tax Rate by Income Group" t={t}><Bar t={t} label="Average salary earners" value={13.3} max={30} color={t.green} suffix="%"/><Bar t={t} label="High earners ($200k–$500k)" value={19.8} max={30} color="#d4834a" suffix="%"/><Bar t={t} label="Top 25 billionaires" value={3.4} max={30} color={t.red} suffix="%"/><p style={{fontSize:11,color:t.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>ProPublica, IRS data</p></ChartCard>),
  gen_income:(t)=>(<ChartCard title="Income Ceiling by Method" t={t}><Bar t={t} label="Employment" value={150} max={10000} color={t.red} prefix="$" suffix="k"/><Bar t={t} label="Freelancing" value={400} max={10000} color="#d4834a" prefix="$" suffix="k"/><Bar t={t} label="Investment returns" value={3000} max={10000} color={t.green} prefix="$" suffix="k"/><Bar t={t} label="Business / system" value={10000} max={10000} color={t.gold} prefix="$" suffix="k+"/></ChartCard>),
};

export function FinanceChart({topicKey,t=C}){const c=FINANCE_CHARTS[topicKey];if(!c)return null;return c(t);}
