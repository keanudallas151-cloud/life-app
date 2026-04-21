import { C } from "../systems/theme";

export function Bar({label,value,max,color,prefix="",suffix=""}){
  const pct=Math.round((value/max)*100);
  return(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style={{fontSize:12,color:C.mid,fontFamily:"Georgia,serif"}}>{label}</span>
        <span style={{fontSize:12,fontWeight:700,color:color||C.green,fontFamily:"Georgia,serif"}}>{prefix}{typeof value==="number"?value.toLocaleString():value}{suffix}</span>
      </div>
      <div style={{height:10,background:C.light,borderRadius:20}}>
        <div style={{height:"100%",width:`${pct}%`,background:color||C.green,borderRadius:20}}/>
      </div>
    </div>
  );
}

export function LineChart({data,color,xLabel}){
  const mx=Math.max(...data.map(d=>d.v));const mn=Math.min(...data.map(d=>d.v));const rng=mx-mn||1;
  const W=280,H=120,P=8;
  const pts=data.map((d,i)=>({x:P+(i/(data.length-1))*(W-P*2),y:H-P-((d.v-mn)/rng)*(H-P*2)}));
  const path=pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
  const fill=path+` L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;
  return(
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",overflow:"visible"}}>
        <defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color||C.green} stopOpacity="0.25"/><stop offset="100%" stopColor={color||C.green} stopOpacity="0.02"/></linearGradient></defs>
        <path d={fill} fill="url(#lcg)"/>
        <path d={path} fill="none" stroke={color||C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color||C.green}/>)}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>{data.map((d,i)=><span key={i} style={{fontSize:10,color:C.muted,fontFamily:"Georgia,serif"}}>{d.l}</span>)}</div>
      {xLabel&&<p style={{fontSize:10,color:C.muted,textAlign:"center",margin:"6px 0 0",fontStyle:"italic"}}>{xLabel}</p>}
    </div>
  );
}

export function ChartCard({title,children}){
  return(
    <div style={{margin:"32px 0",padding:"22px",background:C.white,border:`1px solid ${C.border}`,borderRadius:14}}>
      <p style={{margin:"0 0 18px",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:C.muted}}>{title}</p>
      {children}
    </div>
  );
}

const FINANCE_CHARTS={
  fractional:()=>(<ChartCard title="The Money Multiplier in Action"><Bar label="Your deposit" value={1000} max={10000} color={C.red} prefix="$"/><Bar label="Bank lends out (90%)" value={900} max={10000} color="#d4834a" prefix="$"/><Bar label="Re-deposited & lent again" value={810} max={10000} color="#6FBE77" prefix="$"/><Bar label="Total money supply created" value={10000} max={10000} color={C.green} prefix="$"/><p style={{fontSize:11,color:C.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>10% reserve ratio → 10x money multiplier</p></ChartCard>),
  inflation:()=>(<ChartCard title="Purchasing Power of $10,000 Over Time"><LineChart color={C.red} data={[{l:"Today",v:10000},{l:"5yr",v:8587},{l:"10yr",v:7374},{l:"20yr",v:5438},{l:"30yr",v:4010}]} xLabel="Cash loses half its value every ~23 years at 3% inflation"/></ChartCard>),
  personal_finance:()=>(<ChartCard title="The Cost of Waiting to Invest"><Bar label="Start at 25 (40 years)" value={1746} max={1746} color={C.green} prefix="$" suffix="k"/><Bar label="Start at 35 (30 years)" value={745} max={1746} color="#d4834a" prefix="$" suffix="k"/><Bar label="Start at 45 (20 years)" value={294} max={1746} color={C.red} prefix="$" suffix="k"/><p style={{fontSize:11,color:C.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>$500/month at 8% — starting 10 years later costs over $1M</p></ChartCard>),
  trading:()=>(<ChartCard title="Day Trader Profitability Over Time"><Bar label="Profitable after 1 year" value={20} max={100} color={C.green} suffix="%"/><Bar label="Profitable after 3 years" value={7} max={100} color="#d4834a" suffix="%"/><Bar label="Profitable after 5 years" value={3} max={100} color={C.red} suffix="%"/><p style={{fontSize:11,color:C.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>97% of people who trade for 5+ years are not profitable</p></ChartCard>),
  billionaire_tax:()=>(<ChartCard title="Effective Tax Rate by Income Group"><Bar label="Average salary earners" value={13.3} max={30} color={C.green} suffix="%"/><Bar label="High earners ($200k–$500k)" value={19.8} max={30} color="#d4834a" suffix="%"/><Bar label="Top 25 billionaires" value={3.4} max={30} color={C.red} suffix="%"/><p style={{fontSize:11,color:C.muted,margin:"12px 0 0",fontStyle:"italic",textAlign:"center"}}>ProPublica, IRS data</p></ChartCard>),
  gen_income:()=>(<ChartCard title="Income Ceiling by Method"><Bar label="Employment" value={150} max={10000} color={C.red} prefix="$" suffix="k"/><Bar label="Freelancing" value={400} max={10000} color="#d4834a" prefix="$" suffix="k"/><Bar label="Investment returns" value={3000} max={10000} color={C.green} prefix="$" suffix="k"/><Bar label="Business / system" value={10000} max={10000} color={C.gold} prefix="$" suffix="k+"/></ChartCard>),
};

export function FinanceChart({topicKey}){const c=FINANCE_CHARTS[topicKey];if(!c)return null;return c();}
