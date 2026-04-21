export const CONTENT_TAGS={
  money:["finance","beginner","mindset"],
  basics_au2:["finance","beginner","australia"],
  basics_us:["finance","beginner","usa"],
  personal_finance:["finance","beginner","practical"],
  fractional:["finance","intermediate","economics"],
  federal_reserve:["finance","intermediate","economics"],
  credit_cards:["finance","beginner","practical"],
  inflation:["finance","beginner","economics"],
  dark_pools:["finance","advanced","economics"],
  petrodollar:["finance","advanced","economics"],
  imf_world_bank:["finance","advanced","economics"],
  billionaire_tax:["finance","intermediate","economics"],
  housing_trap:["finance","intermediate","practical"],
  adv_finance:["finance","advanced","practical"],
  secrets:["finance","intermediate","economics"],
  gen_income:["finance","intermediate","business","practical"],
  trading:["finance","advanced","business"],
  dropship:["business","beginner","practical"],
  ai_services:["business","beginner","practical","technology"],
  super:["finance","beginner","australia"],
  psych_money:["mindset","intermediate","finance"],
  bias:["mindset","intermediate","psychology"],
  stoicism:["mindset","beginner","philosophy"],
  milgram:["psychology","intermediate","social"],
  stanford_prison:["psychology","intermediate","social"],
  learned_helpless:["psychology","beginner","mindset"],
  dopamine:["psychology","intermediate","mindset"],
  nihilism:["philosophy","intermediate","mindset"],
  platos_cave:["philosophy","beginner","mindset"],
  manufactured_consent:["psychology","advanced","social"],
};

export const TSD_WEIGHTS={
  goals:{
    "Generate Income":      {finance:3,business:2,practical:2},
    "Start A Business":     {business:3,finance:2,practical:2},
    "Improving Mindset":    {mindset:3,psychology:2,philosophy:1},
    "Learning":             {philosophy:2,psychology:2,finance:1},
    "Freedom":              {finance:2,mindset:2,philosophy:2},
    "To Be Wiser":          {philosophy:3,mindset:2,psychology:1},
  },
  motivation:{
    "Financial Freedom":    {finance:3,business:2,practical:2},
    "Self-Improvement":     {mindset:3,psychology:2,philosophy:1},
    "Curiosity":            {philosophy:2,psychology:2,finance:1},
    "Solve Personal Problems":{practical:3,mindset:2,psychology:1},
    "Self-Discipline And Structure":{mindset:3,philosophy:2,psychology:1},
  },
  finance_level:{
    "No understanding (Beginner)": {beginner:3},
    "Basic understanding":         {beginner:2,intermediate:1},
    "Intermediate":                {intermediate:3},
    "Advanced":                    {advanced:2,intermediate:1},
    "Expert Understanding":        {advanced:3},
  },
  english_level:{
    "Beginner":         {short:3,simple:3},
    "Fluent":           {standard:3},
    "Shakespeare Level":{advanced_reading:3,philosophy:1},
  },
  learning_style:{
    "Reading":              {reading:3},
    "Videos":               {video:3},
    "Interactive/Hands-on": {practical:3,interactive:3},
    "Audio":                {audio:3},
  },
  life_areas:{
    "Finance":              {finance:3,practical:2},
    "Psychology/Mindset":   {mindset:3,psychology:2},
    "Discipline":           {mindset:2,philosophy:2,psychology:1},
    "Social Skills":        {social:3,psychology:2},
    "Health":               {mindset:2,psychology:1},
    "Business/Entrepreneurship":{business:3,finance:2,practical:2},
    "Communication":        {social:2,philosophy:1,psychology:1},
    "Productivity":         {practical:3,mindset:2,business:1},
  },
};

export function buildProfile(answers){
  const scores={};
  const add=(cat,val)=>{scores[cat]=(scores[cat]||0)+val;};
  if(answers.goals)Object.entries(TSD_WEIGHTS.goals[answers.goals]||{}).forEach(([k,v])=>add(k,v));
  if(answers.motivation)Object.entries(TSD_WEIGHTS.motivation[answers.motivation]||{}).forEach(([k,v])=>add(k,v));
  if(answers.finance_level)Object.entries(TSD_WEIGHTS.finance_level[answers.finance_level]||{}).forEach(([k,v])=>add(k,v));
  if(answers.english_level)Object.entries(TSD_WEIGHTS.english_level[answers.english_level]||{}).forEach(([k,v])=>add(k,v));
  if(answers.learning_style)Object.entries(TSD_WEIGHTS.learning_style[answers.learning_style]||{}).forEach(([k,v])=>add(k,v));
  if(answers.life_areas)answers.life_areas.forEach(area=>{Object.entries(TSD_WEIGHTS.life_areas[area]||{}).forEach(([k,v])=>add(k,v));});
  const diffMap={"No understanding (Beginner)":"beginner","Basic understanding":"beginner","Intermediate":"intermediate","Advanced":"advanced","Expert Understanding":"advanced"};
  const difficulty=diffMap[answers.finance_level]||"beginner";
  const max=Math.max(1,...Object.values(scores));
  const norm={};
  Object.entries(scores).forEach(([k,v])=>{norm[k]=Math.round((v/max)*100)/100;});
  const topCats=Object.entries(norm).filter(([k])=>["finance","mindset","psychology","business","philosophy","practical","social"].includes(k)).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
  return{scores:norm,difficulty,topCats,answers,time:answers.time||40};
}

export function computeEssentialScore(key,profile){
  if(!profile)return null;
  const tags=CONTENT_TAGS[key];
  if(!tags)return null;
  const s=profile.scores||{};
  let total=0,count=0;
  tags.forEach(tag=>{if(s[tag]!==undefined){total+=s[tag];count++;}});
  if(!count)return null;
  return Math.min(1,total/count);
}

export function getPersonalisedRelated(related,profile){
  if(!profile||!related)return related;
  return [...related].sort((a,b)=>{
    const sa=computeEssentialScore(a.key,profile)||0;
    const sb=computeEssentialScore(b.key,profile)||0;
    return sb-sa;
  });
}
