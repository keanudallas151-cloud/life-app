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
  age_group:{
    "13-17":  {beginner:3,simple:2,mindset:1},
    "18-24":  {practical:2,business:1,finance:2},
    "25-34":  {finance:3,business:2,practical:2},
    "35-44":  {finance:2,practical:3,mindset:1},
    "45+":    {philosophy:2,mindset:2,finance:1},
  },
  biggest_challenge:{
    "Lack of motivation":           {mindset:3,psychology:2},
    "Not enough money":             {finance:3,business:2,practical:1},
    "No clear direction":           {philosophy:2,mindset:2,practical:1},
    "Bad habits / discipline":      {mindset:3,psychology:1,practical:1},
    "Social anxiety / confidence":  {social:3,psychology:2,mindset:1},
    "Time management":              {practical:3,mindset:1,business:1},
  },
  reading_frequency:{
    "Never / rarely":     {simple:3,short:2,beginner:1},
    "A few times a month":{standard:2,beginner:1},
    "Weekly":             {standard:3,intermediate:1},
    "Daily reader":       {advanced_reading:2,intermediate:2},
  },
  accountability_style:{
    "I prefer solo learning":         {reading:2,mindset:1},
    "I like tracking my progress":    {practical:2,interactive:1},
    "I need a community":             {social:3,psychology:1},
    "I work best with a mentor":      {practical:2,social:1,psychology:1},
  },
  content_depth:{
    "Quick tips & summaries":         {short:3,simple:2,beginner:1},
    "Balanced — some detail":         {standard:3,intermediate:1},
    "Deep dives & full breakdowns":   {advanced_reading:3,advanced:2},
    "I want everything available":    {standard:1,advanced_reading:1,advanced:1},
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
  if(answers.age_group)Object.entries(TSD_WEIGHTS.age_group[answers.age_group]||{}).forEach(([k,v])=>add(k,v));
  if(answers.biggest_challenge)Object.entries(TSD_WEIGHTS.biggest_challenge[answers.biggest_challenge]||{}).forEach(([k,v])=>add(k,v));
  if(answers.reading_frequency)Object.entries(TSD_WEIGHTS.reading_frequency[answers.reading_frequency]||{}).forEach(([k,v])=>add(k,v));
  if(answers.accountability_style)Object.entries(TSD_WEIGHTS.accountability_style[answers.accountability_style]||{}).forEach(([k,v])=>add(k,v));
  if(answers.content_depth)Object.entries(TSD_WEIGHTS.content_depth[answers.content_depth]||{}).forEach(([k,v])=>add(k,v));
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
