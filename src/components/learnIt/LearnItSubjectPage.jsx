import { useState, useEffect, useRef } from "react";

const FONT = "-apple-system, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Arial, sans-serif";

/* ──────────────────────────────────────────────────────────────
   SUBJECT CONFIG
────────────────────────────────────────────────────────────── */
const SUBJECT_META = {
  english:  { label: "English",  emoji: "📖", color: "#3B82F6", lightColor: "rgba(59,130,246,0.12)", borderColor: "rgba(59,130,246,0.25)" },
  finance:  { label: "Finance",  emoji: "💰", color: "#50c878", lightColor: "rgba(80,200,120,0.12)",  borderColor: "rgba(80,200,120,0.25)"  },
  demeanor: { label: "Demeanor", emoji: "🎯", color: "#A855F7", lightColor: "rgba(168,85,247,0.12)", borderColor: "rgba(168,85,247,0.25)" },
};

/* ──────────────────────────────────────────────────────────────
   GAME DATA
────────────────────────────────────────────────────────────── */
const GAMES = {
  english: [
    { id: "fill_gap",     icon: "✏️", title: "Fill the Gap",     desc: "Complete the sentence with the right word.",    type: "game" },
    { id: "word_guess",   icon: "🔤", title: "Word Guess",       desc: "Guess the hidden word one letter at a time.",   type: "game" },
    { id: "vocab_match",  icon: "🔗", title: "Vocab Match",      desc: "Match words to their definitions fast.",        type: "game" },
    { id: "sentence",     icon: "🔀", title: "Sentence Builder", desc: "Tap words in the correct order.",               type: "game" },
    { id: "word_trivia",  icon: "❓", title: "Word Trivia",      desc: "Test your knowledge of the English language.",  type: "game" },
    { id: "word_ladder",  icon: "🪜", title: "Word Ladder",      desc: "Change one letter at a time to reach the goal.",type: "game" },
  ],
  finance: [
    { id: "fin_terms",    icon: "📚", title: "Finance Terms",    desc: "Flip cards to learn key money vocabulary.",     type: "tool" },
    { id: "budget",       icon: "📊", title: "Budget Builder",   desc: "Allocate your monthly income wisely.",          type: "tool" },
    { id: "fin_trivia",   icon: "🧠", title: "Finance Trivia",   desc: "Quiz yourself on real money concepts.",         type: "game" },
    { id: "invest_save",  icon: "📈", title: "Invest or Save?",  desc: "Make smart decisions in live scenarios.",       type: "game" },
    { id: "money_math",   icon: "🔢", title: "Money Math",       desc: "Quick mental maths — beat the clock.",          type: "game" },
    { id: "compound",     icon: "📈", title: "Compound Growth",  desc: "Estimate compound interest — beat the clock.",   type: "game" },
  ],
  demeanor: [
    { id: "speak_it",     icon: "🗣️", title: "Speak It",        desc: "Pick the most confident response.",             type: "game" },
    { id: "filler_catch", icon: "🚫", title: "Filler Catcher",  desc: "Tap every filler word in the paragraph.",       type: "game" },
    { id: "tone_detect",  icon: "🎵", title: "Tone Detector",   desc: "Identify the tone of different messages.",      type: "game" },
    { id: "conf_quiz",    icon: "⭐", title: "Confidence Quiz", desc: "Find out where your confidence really stands.", type: "game" },
    { id: "daily_dem",    icon: "📅", title: "Daily Challenge", desc: "One challenge a day to sharpen your presence.", type: "tool" },
    { id: "body_lang",    icon: "🧍", title: "Body Language IQ",desc: "Read the room with body language mastery.",     type: "game" },
  ],
};

/* ──────────────────────────────────────────────────────────────
   GAME CONTENT
────────────────────────────────────────────────────────────── */

// ── English: Fill the Gap ──────────────────────────────────────
const FILL_GAP_QS = [
  { sentence: "She spoke with great ___ during the presentation.", options: ["confidence","confusion","sadness","anger"], answer: "confidence" },
  { sentence: "The ___ of the river was crystal clear.", options: ["water","colour","surface","texture"], answer: "surface" },
  { sentence: "He ___ the book in just two days.", options: ["finished","broken","slept","drove"], answer: "finished" },
  { sentence: "The team worked hard to ___ their goal.", options: ["achieve","avoid","ignore","destroy"], answer: "achieve" },
  { sentence: "She had a ___ smile that lit up the room.", options: ["radiant","dull","tiny","cold"], answer: "radiant" },
  { sentence: "Reading daily helps ___ your vocabulary.", options: ["expand","shrink","break","limit"], answer: "expand" },
  { sentence: "The ___ athlete trained for years to reach the Olympics.", options: ["dedicated","lazy","average","tired"], answer: "dedicated" },
  { sentence: "He always arrives ___ to every meeting.", options: ["punctually","late","barely","randomly"], answer: "punctually" },
  { sentence: "She was ___ when she learned she had won the award.", options: ["ecstatic","furious","bored","confused"], answer: "ecstatic" },
  { sentence: "The politician gave an ___ speech to the crowd.", options: ["boring","inspiring","silent","angry"], answer: "inspiring" },
  { sentence: "He made a ___ decision that changed his career forever.", options: ["trivial","pivotal","random","small"], answer: "pivotal" },
  { sentence: "She managed to ___ the situation before it got worse.", options: ["worsen","defuse","ignore","create"], answer: "defuse" },
  { sentence: "The company saw a ___ increase in profits last year.", options: ["minimal","substantial","slight","invisible"], answer: "substantial" },
  { sentence: "He was ___ in his efforts to improve every single day.", options: ["lazy","relentless","careless","hesitant"], answer: "relentless" },
  { sentence: "The new employee was ___ and eager to learn.", options: ["reluctant","enthusiastic","exhausted","unhappy"], answer: "enthusiastic" },
  { sentence: "She wrote a ___ letter to the board explaining her concerns.", options: ["confusing","compelling","irrelevant","rude"], answer: "compelling" },
  { sentence: "The concert was ___ by the unexpected thunderstorm.", options: ["improved","disrupted","helped","ignored"], answer: "disrupted" },
  { sentence: "He showed great ___ by admitting his mistake publicly.", options: ["cowardice","integrity","stubbornness","arrogance"], answer: "integrity" },
  { sentence: "The scientist made a ___ discovery that changed medicine forever.", options: ["ordinary","groundbreaking","minor","expected"], answer: "groundbreaking" },
  { sentence: "She always tries to see the ___ side of every situation.", options: ["negative","positive","hidden","dark"], answer: "positive" },
  { sentence: "He is known for his ___ attention to detail.", options: ["poor","meticulous","careless","random"], answer: "meticulous" },
  { sentence: "The children were ___ when the school trip was cancelled.", options: ["thrilled","disappointed","bored","relieved"], answer: "disappointed" },
  { sentence: "He spoke in a ___ voice to calm the frightened animal.", options: ["loud","soothing","harsh","quick"], answer: "soothing" },
  { sentence: "The company needs to ___ its strategy to remain competitive.", options: ["ignore","adapt","copy","abandon"], answer: "adapt" },
  { sentence: "She gave a ___ performance that received a standing ovation.", options: ["flawed","flawless","average","rushed"], answer: "flawless" },
  { sentence: "He is a ___ leader who inspires everyone around him.", options: ["timid","charismatic","selfish","absent"], answer: "charismatic" },
  { sentence: "She was ___ in her belief that hard work always pays off.", options: ["doubtful","unwavering","uncertain","confused"], answer: "unwavering" },
  { sentence: "The novel was so ___ that she read it in one sitting.", options: ["dull","captivating","confusing","brief"], answer: "captivating" },
  { sentence: "He made an ___ contribution to the project's success.", options: ["minimal","invaluable","unnoticed","harmful"], answer: "invaluable" },
  { sentence: "She expressed her views with great ___ and clarity.", options: ["eloquence","rudeness","hesitation","silence"], answer: "eloquence" },
  { sentence: "The award was ___ by all who knew his dedication.", options: ["surprising","deserved","unfair","random"], answer: "deserved" },
  { sentence: "He was too ___ to ask for help when he needed it.", options: ["eager","proud","happy","wise"], answer: "proud" },
  { sentence: "The ___ student finished the exam well before time.", options: ["slow","distracted","diligent","anxious"], answer: "diligent" },
  { sentence: "She kept a ___ tone throughout the difficult negotiation.", options: ["aggressive","calm","panicked","dismissive"], answer: "calm" },
  { sentence: "His ___ humour made even the toughest days bearable.", options: ["dry","wet","sharp","heavy"], answer: "dry" },
  { sentence: "The team's ___ effort led to a record-breaking result.", options: ["collective","individual","selfish","random"], answer: "collective" },
  { sentence: "The project manager kept the team ___ with regular updates.", options: ["confused","informed","distracted","silent"], answer: "informed" },
  { sentence: "She demonstrated ___ leadership by stepping up during the crisis.", options: ["passive","exemplary","hesitant","average"], answer: "exemplary" },
  { sentence: "The research paper was ___ by leading experts in the field.", options: ["ignored","peer-reviewed","dismissed","written"], answer: "peer-reviewed" },
  { sentence: "His ___ approach to the problem saved the company thousands.", options: ["reckless","innovative","careless","costly"], answer: "innovative" },
  { sentence: "She remained ___ despite the chaos unfolding around her.", options: ["frantic","composed","nervous","distracted"], answer: "composed" },
  { sentence: "The contract was ___ after both parties reached an agreement.", options: ["cancelled","finalised","ignored","delayed"], answer: "finalised" },
  { sentence: "He was praised for his ___ response during the emergency.", options: ["slow","delayed","swift","cautious"], answer: "swift" },
  { sentence: "The new system was more ___ than anything they had used before.", options: ["complicated","outdated","efficient","confusing"], answer: "efficient" },
  { sentence: "The journalist published a ___ exposé on corporate misconduct.", options: ["biased","damaging","thorough","brief"], answer: "thorough" },
  { sentence: "Her writing style is ___ — she never wastes a single word.", options: ["verbose","repetitive","succinct","confusing"], answer: "succinct" },
  { sentence: "The negotiation required both parties to make ___.", options: ["enemies","demands","compromises","decisions"], answer: "compromises" },
  { sentence: "The team's ___ was evident in the seamless execution of the event.", options: ["chaos","coordination","confusion","disagreement"], answer: "coordination" },
  { sentence: "He was known for his ___ wit and sharp observations.", options: ["dull","incisive","slow","gentle"], answer: "incisive" },
  { sentence: "The architecture of the building was ___ by its historic surroundings.", options: ["ignored","inspired","disturbed","limited"], answer: "inspired" },
  { sentence: "The athlete showed ___ determination, training through pain and setbacks.", options: ["little","extraordinary","minimal","average"], answer: "extraordinary" },
];

// ── English: Word Guess (Wordle-style) ─────────────────────────
const WORD_LIST = [
  "SPEAK","TRADE","MONEY","LEARN","SMART","BRAVE","FOCUS","THINK","SKILL","WORTH",
  "SHINE","GRACE","PRIDE","DRIVE","ADAPT","TRUST","VOICE","REACH","CRAFT","SHAPE",
  "CLEAR","SHARP","POWER","LIGHT","PLANT","CLIMB","BLEND","FLAME","CLOUD","DREAM",
  "STORM","STEEL","BLOOM","FLAIR","CHARM","GROOM","POISE","NOBLE","PEACE","HEART",
  "GREET","HASTE","INNER","QUITE","REACT","SERVE","TEACH","UNITY","VITAL","WEAVE",
  "YOUTH","ADORE","ANGER","BASIC","BLANK","BONUS","BOUND","BRAIN","BROAD","BUILD",
  "CATCH","DANCE","EAGLE","FANCY","GIANT","HAPPY","IMAGE","JUDGE","KNIFE","LEGAL",
  "MAJOR","NIGHT","OLIVE","PHASE","QUEST","RADAR","SQUAD","TABLE","ULTRA","BLAZE",
  "GRANT","SOLVE","FORCE","CHESS","FROST","GAVEL","PERCH","TROVE","EXACT","PLUMB",
];

// ── English: Vocab Match ───────────────────────────────────────
const VOCAB_PAIRS = [
  { word: "Eloquent",     def: "Well-spoken and expressive" },
  { word: "Diligent",     def: "Hardworking and careful" },
  { word: "Resilient",    def: "Bounces back from difficulty" },
  { word: "Concise",      def: "Clear and brief" },
  { word: "Ambiguous",    def: "Open to more than one meaning" },
  { word: "Verbose",      def: "Using more words than needed" },
  { word: "Tenacious",    def: "Persistent and determined" },
  { word: "Pragmatic",    def: "Practical and results-focused" },
  { word: "Articulate",   def: "Able to express ideas clearly" },
  { word: "Candid",       def: "Honest and direct" },
  { word: "Empathetic",   def: "Understands others' feelings" },
  { word: "Insightful",   def: "Shows deep understanding" },
  { word: "Meticulous",   def: "Very careful and precise" },
  { word: "Proficient",   def: "Competent and skilled" },
  { word: "Succinct",     def: "Expressed in very few words" },
  { word: "Astute",       def: "Clever and perceptive" },
  { word: "Benevolent",   def: "Kind and generous" },
  { word: "Credible",     def: "Worthy of trust and belief" },
  { word: "Discerning",   def: "Shows keen judgement" },
  { word: "Fervent",      def: "Showing intense passion" },
  { word: "Gregarious",   def: "Sociable and fond of company" },
  { word: "Humble",       def: "Modest and not arrogant" },
  { word: "Impeccable",   def: "Perfect, without any flaws" },
  { word: "Lucid",        def: "Clear and easy to understand" },
  { word: "Forthright",  def: "Direct and outspoken in speech" },
  { word: "Tenuous",     def: "Very weak or insubstantial" },
  { word: "Adept",       def: "Very skilled or proficient at something" },
  { word: "Exemplary",   def: "Serving as a model worthy of imitation" },
  { word: "Nuanced",     def: "Showing subtle shades of difference or meaning" },
  { word: "Deft",        def: "Neatly skilful and quick in movement" },
];

// ── English: Sentence Builder ──────────────────────────────────
const SENTENCE_QS = [
  { hint: "Core Advice",   words: ["always", "hard", "You", "should", "work"],        answer: ["You", "should", "always", "work", "hard"] },
  { hint: "Proverb",       words: ["the", "Knowledge", "key", "is", "to", "success"], answer: ["Knowledge", "is", "the", "key", "to", "success"] },
  { hint: "Growth",        words: ["your", "Build", "every", "skills", "day"],         answer: ["Build", "your", "skills", "every", "day"] },
  { hint: "Daily Habit",   words: ["reading", "daily", "Start", "books"],              answer: ["Start", "reading", "books", "daily"] },
  { hint: "Resilience",    words: ["never", "You", "give", "should", "up"],            answer: ["You", "should", "never", "give", "up"] },
  { hint: "Communication", words: ["speak", "Practise", "to", "clearly"],              answer: ["Practise", "to", "speak", "clearly"] },
  { hint: "Time",          words: ["time", "your", "Manage", "wisely"],                answer: ["Manage", "your", "time", "wisely"] },
  { hint: "Goal Setting",  words: ["a", "goal", "Set", "every", "week"],               answer: ["Set", "a", "goal", "every", "week"] },
  { hint: "Listening",     words: ["Listen", "more", "than", "you", "speak"],          answer: ["Listen", "more", "than", "you", "speak"] },
  { hint: "Confidence",    words: ["ideas", "Share", "your", "confidently"],           answer: ["Share", "your", "ideas", "confidently"] },
  { hint: "Learning",      words: ["mistakes", "from", "Learn", "your"],               answer: ["Learn", "from", "your", "mistakes"] },
  { hint: "Gratitude",     words: ["day", "every", "Be", "grateful"],                  answer: ["Be", "grateful", "every", "day"] },
  { hint: "Success",       words: ["the", "Consistency", "key", "is"],                 answer: ["Consistency", "is", "the", "key"] },
  { hint: "Feedback",      words: ["feedback", "Seek", "regularly"],                   answer: ["Seek", "feedback", "regularly"] },
  { hint: "Relationships", words: ["a", "good", "Be", "listener"],                     answer: ["Be", "a", "good", "listener"] },
  { hint: "Action",        words: ["action", "Take", "now"],                           answer: ["Take", "action", "now"] },
  { hint: "Communication", words: ["words", "your", "Choose", "carefully"],            answer: ["Choose", "your", "words", "carefully"] },
  { hint: "Mindset",       words: ["positive", "Stay", "under", "pressure"],           answer: ["Stay", "positive", "under", "pressure"] },
  { hint: "Respect",       words: ["others", "Respect", "always"],                     answer: ["Respect", "others", "always"] },
  { hint: "Mindset",       words: ["mindset", "growth", "Develop", "a"],               answer: ["Develop", "a", "growth", "mindset"] },
  { hint: "Leadership",    words: ["Always", "lead", "by", "example"],                 answer: ["Always", "lead", "by", "example"] },
  { hint: "Persistence",   words: ["every", "hard", "Try", "day"],                     answer: ["Try", "hard", "every", "day"] },
  { hint: "Confidence",    words: ["first", "impression", "A", "matters"],             answer: ["A", "first", "impression", "matters"] },
  { hint: "Mindset",       words: ["can", "You", "do", "this"],                        answer: ["You", "can", "do", "this"] },
  { hint: "Communication", words: ["honestly", "clearly", "Speak", "and"],             answer: ["Speak", "clearly", "and", "honestly"] },
];

// ── English: Word Trivia ───────────────────────────────────────
const WORD_TRIVIA = [
  { q: "How many letters are in the English alphabet?", opts: ["24","25","26","27"], ans: "26", tip: "The English alphabet has 26 letters, A through Z." },
  { q: "What is the most commonly used letter in English?", opts: ["A","T","E","S"], ans: "E", tip: "The letter E appears most frequently in written English." },
  { q: "What is a word that reads the same forwards and backwards?", opts: ["Homonym","Palindrome","Synonym","Acronym"], ans: "Palindrome", tip: "Examples: 'racecar', 'level', 'noon'." },
  { q: "Which of these is a noun?", opts: ["Run","Quickly","Beautiful","Success"], ans: "Success", tip: "Nouns name people, places, things, or ideas. Success is an idea." },
  { q: "What does 'verbose' mean?", opts: ["Brief","Wordy","Clear","Silent"], ans: "Wordy", tip: "Verbose = using more words than needed. The opposite is concise." },
  { q: "How many vowels are in the English language?", opts: ["4","5","6","7"], ans: "5", tip: "A, E, I, O, U are the five vowels. Y is sometimes considered one." },
  { q: "What is a synonym?", opts: ["Opposite word","Word with same meaning","Word that rhymes","Made-up word"], ans: "Word with same meaning", tip: "E.g. 'happy' and 'joyful' are synonyms." },
  { q: "What is an antonym?", opts: ["Word with same meaning","Opposite word","Type of verb","A sentence starter"], ans: "Opposite word", tip: "E.g. 'hot' and 'cold' are antonyms." },
  { q: "Which sentence is grammatically correct?", opts: ["She don't like it","She doesn't likes it","She doesn't like it","She not like it"], ans: "She doesn't like it", tip: "Use 'doesn't' (does not) with she/he/it in simple present." },
  { q: "What is a conjunction?", opts: ["A naming word","A describing word","A joining word","An action word"], ans: "A joining word", tip: "Conjunctions join clauses: and, but, because, so, although." },
  { q: "Which word is an adjective?", opts: ["Run","Bright","Slowly","Them"], ans: "Bright", tip: "Adjectives describe nouns. 'Bright' describes how something looks or feels." },
  { q: "What is the past tense of 'teach'?", opts: ["Teached","Tought","Taught","Teachd"], ans: "Taught", tip: "Teach is an irregular verb. Past tense = taught." },
  { q: "A word formed from the initials of other words is called a(n):", opts: ["Palindrome","Acronym","Metaphor","Simile"], ans: "Acronym", tip: "E.g. NASA = National Aeronautics and Space Administration." },
  { q: "Which sentence uses a simile?", opts: ["She is a lion","He ran like the wind","The stars danced","Time flies"], ans: "He ran like the wind", tip: "A simile compares using 'like' or 'as'. A metaphor says something IS something." },
  { q: "What does 'prefix' mean?", opts: ["Word ending","Word beginning addition","Middle of a word","Silent letter"], ans: "Word beginning addition", tip: "E.g. 'un-' in 'unhappy' reverses the meaning." },
  { q: "Which is a proper noun?", opts: ["city","river","London","mountain"], ans: "London", tip: "Proper nouns name specific places, people, or things. Always capitalised." },
  { q: "What is the plural of 'child'?", opts: ["Childs","Children","Childes","Childrens"], ans: "Children", tip: "Child → Children. An irregular plural, not just adding -s." },
  { q: "Which is an adverb?", opts: ["Quick","Quickly","Quicker","Quickest"], ans: "Quickly", tip: "Adverbs modify verbs, adjectives, or other adverbs. Often end in -ly." },
  { q: "What does 'ambiguous' mean?", opts: ["Totally clear","Having two or more meanings","Very short","Very loud"], ans: "Having two or more meanings", tip: "Ambiguous writing can be misunderstood. Clarity is always better." },
  { q: "Which punctuation ends a question?", opts: ["Full stop","Exclamation mark","Question mark","Comma"], ans: "Question mark", tip: "Questions end with ? — e.g. 'How are you?'" },
  { q: "What is a metaphor?", opts: ["A type of verb","A comparison using like/as","A direct comparison without like/as","A type of adjective"], ans: "A direct comparison without like/as", tip: "E.g. 'Life is a journey' — not 'Life is LIKE a journey'." },
  { q: "What does 'eloquent' mean?", opts: ["Confused","Well-spoken and persuasive","Silent","Rude"], ans: "Well-spoken and persuasive", tip: "An eloquent speaker expresses ideas fluently and impressively." },
  { q: "How many syllables does 'communication' have?", opts: ["4","5","6","7"], ans: "6", tip: "com-mu-ni-ca-tion = 6 syllables." },
  { q: "What is the opposite of 'expand'?", opts: ["Grow","Contract","Inflate","Increase"], ans: "Contract", tip: "Expand = grow larger. Contract = become smaller." },
  { q: "Which is a collective noun for fish?", opts: ["Pack","Herd","School","Flock"], ans: "School", tip: "A school of fish. A herd of cattle. A flock of birds. A pack of wolves." },
  { q: "What does the prefix 'mis-' mean?", opts: ["Again","Before","Wrongly","After"], ans: "Wrongly", tip: "Misunderstand = understand wrongly. Misplace = place wrongly." },
  { q: "Which tense is: 'She has eaten'?", opts: ["Simple past","Present perfect","Future","Present continuous"], ans: "Present perfect", tip: "Present perfect uses has/have + past participle. Links past to now." },
  { q: "What is a homophone?", opts: ["Word with same spelling","Word with same sound, different meaning","Opposite word","Made-up word"], ans: "Word with same sound, different meaning", tip: "E.g. 'hear' and 'here' sound the same but mean different things." },
  { q: "Which sentence is passive?", opts: ["She kicked the ball","The ball was kicked by her","She kicks well","She is kicking"], ans: "The ball was kicked by her", tip: "Passive voice: subject receives the action. Active voice is usually clearer." },
  { q: "What does 'concise' mean?", opts: ["Long and detailed","Short and clear","Repetitive","Confusing"], ans: "Short and clear", tip: "Concise writing says the most with the fewest words." },
  { q: "Which sentence uses correct subject-verb agreement?", opts: ["The team are playing well","The team is playing well","The team were playing well","The team play good"], ans: "The team is playing well", tip: "Collective nouns like 'team' take singular verbs in American English." },
  { q: "What is the comparative form of 'good'?", opts: ["Gooder","More good","Better","Goodest"], ans: "Better", tip: "Good → Better → Best. Irregular comparatives are common in English." },
  { q: "What does the suffix '-tion' typically indicate?", opts: ["An adjective","An action or process","A person","A location"], ans: "An action or process", tip: "E.g. education (the process of educating), imagination, communication." },
  { q: "Which of these is an example of alliteration?", opts: ["She sells sea shells","The sun rose slowly","A red apple","Running fast"], ans: "She sells sea shells", tip: "Alliteration = repeated initial consonant sounds in consecutive or close words." },
  { q: "What does 'irony' mean?", opts: ["Saying exactly what you mean","Saying the opposite of what you mean for effect","A type of metaphor","Exaggeration for emphasis"], ans: "Saying the opposite of what you mean for effect", tip: "E.g. 'Oh great, another flat tyre' when something bad happens." },
  { q: "What is the subject of: 'The big brown dog barked loudly'?", opts: ["Barked","Loudly","The big brown dog","Brown"], ans: "The big brown dog", tip: "The subject is who or what the sentence is about — the dog." },
  { q: "What is the correct spelling?", opts: ["Accomodate","Accommodate","Acommodate","Accommadate"], ans: "Accommodate", tip: "Remember: two C's and two M's — a-c-c-o-m-m-o-d-a-t-e." },
  { q: "Which word is a preposition?", opts: ["Quickly","Between","Joyful","Shout"], ans: "Between", tip: "Prepositions show position, direction, or relationship: in, on, at, between, under." },
  { q: "What does 'empathy' mean?", opts: ["Feeling superior to others","The ability to understand others' feelings","Being emotionally cold","Feeling sorry for yourself"], ans: "The ability to understand others' feelings", tip: "Empathy = feeling WITH someone. Sympathy = feeling FOR someone." },
  { q: "What is the future tense of 'to write'?", opts: ["Wrote","Written","Will write","Has written"], ans: "Will write", tip: "Simple future uses 'will' + base verb: I will write, she will write." },
  { q: "Which punctuation mark introduces a list?", opts: ["Semicolon","Comma","Colon","Hyphen"], ans: "Colon", tip: "A colon (:) introduces a list, explanation, or quotation." },
  { q: "What is an oxymoron?", opts: ["Words with the same sound","Two contradictory words together","A type of poem","A figure of speech using comparison"], ans: "Two contradictory words together", tip: "E.g. 'deafening silence', 'living death', 'bittersweet'. The contrast creates effect." },
  { q: "What is 'onomatopoeia'?", opts: ["A type of rhyme","A word that sounds like what it describes","A comparison using 'like' or 'as'","A word with double meaning"], ans: "A word that sounds like what it describes", tip: "E.g. buzz, crash, sizzle, hiss — the sound reflects the meaning." },
  { q: "Which sentence contains a dangling modifier?", opts: ["Running fast, he caught the bus","Running fast, the bus was caught","She ran fast to catch the bus","He quickly ran to the bus"], ans: "Running fast, the bus was caught", tip: "The modifier 'running fast' has no logical subject — the bus can't run!" },
  { q: "What is the rule for 'i before e'?", opts: ["Always use i before e","Use i before e except after c","Use e before i after c","There is no rule"], ans: "Use i before e except after c", tip: "E.g. believe, achieve, but receive, ceiling. Exceptions include 'weird'." },
  { q: "What does it mean to write in an 'active voice'?", opts: ["The subject performs the action","The subject receives the action","The verb is in past tense","The sentence is very short"], ans: "The subject performs the action", tip: "Active: 'The dog chased the cat.' Passive: 'The cat was chased by the dog.'" },
  { q: "What is a 'clause' in grammar?", opts: ["A type of full stop","A group of words with a subject and verb","A type of adjective","A word that links sentences"], ans: "A group of words with a subject and verb", tip: "Independent clauses are complete sentences. Dependent clauses need more." },
  { q: "Which is the correct use of a semicolon?", opts: ["She ran quickly; to the shop","I love reading; she loves writing","Go to the market; and buy milk","He was; tired after the run"], ans: "I love reading; she loves writing", tip: "A semicolon joins two related independent clauses without a conjunction." },
];

// ── Finance: Flashcard Terms ───────────────────────────────────
const FIN_TERMS = [
  { term: "Compound Interest", def: "Earning interest on your interest — the most powerful force in investing." },
  { term: "Net Worth", def: "What you own (assets) minus what you owe (liabilities)." },
  { term: "ROI", def: "Return On Investment — how much profit you make relative to cost." },
  { term: "Dividend", def: "A portion of a company's profit paid to shareholders." },
  { term: "Inflation", def: "The rate at which prices rise, reducing purchasing power over time." },
  { term: "Equity", def: "Your ownership stake in an asset or company." },
  { term: "Liquidity", def: "How easily an asset can be converted to cash without losing value." },
  { term: "Portfolio", def: "A collection of investments held by an individual or organisation." },
  { term: "Asset", def: "Anything of value you own — property, stocks, cash, or intellectual property." },
  { term: "Liability", def: "Money you owe — debts, mortgages, credit card balances." },
  { term: "Bull Market", def: "A market trending upward, with rising prices and investor confidence." },
  { term: "Bear Market", def: "A market falling 20%+ from recent highs, often accompanied by pessimism." },
  { term: "Index Fund", def: "A passive fund that tracks a market index like the S&P 500." },
  { term: "ETF", def: "Exchange-Traded Fund — like a mutual fund but traded on the stock exchange." },
  { term: "Budget", def: "A plan that allocates your income to spending, saving, and investing." },
  { term: "Emergency Fund", def: "3–6 months of expenses saved as a financial safety net." },
  { term: "Interest Rate", def: "The cost of borrowing money, or the reward for saving — expressed as %." },
  { term: "Capital Gains", def: "Profit from selling an asset for more than you paid for it." },
  { term: "Diversification", def: "Spreading investments across many assets to reduce risk." },
  { term: "Dollar-Cost Averaging", def: "Investing a fixed amount regularly regardless of market price." },
  { term: "Gross Income", def: "Total income before taxes or deductions." },
  { term: "Net Income", def: "Income after taxes and deductions — your actual take-home pay." },
  { term: "Credit Score", def: "A number (300–850) rating your creditworthiness based on payment history." },
  { term: "Amortisation", def: "Paying off a loan in regular instalments over time." },
  { term: "Risk Tolerance", def: "Your ability and willingness to handle investment losses." },
  { term: "Hedge", def: "An investment made to offset potential losses in another investment." },
  { term: "IPO", def: "Initial Public Offering — when a private company first sells shares publicly." },
  { term: "Volatility", def: "How much an asset's price fluctuates up and down over time." },
  { term: "Bond", def: "A loan you make to a company or government in exchange for interest payments." },
  { term: "Yield", def: "The income returned on an investment, typically as an annual percentage." },
];

// ── Finance: Trivia ────────────────────────────────────────────
const FIN_TRIVIA = [
  { q: "What does 'APR' stand for?", opts: ["Annual Payment Rate","Annual Percentage Rate","Asset Purchase Rate","Average Profit Return"], ans: "Annual Percentage Rate", tip: "APR is the yearly interest rate charged on borrowing." },
  { q: "What is the stock market index that tracks the 500 largest US companies?", opts: ["NASDAQ","Dow Jones","S&P 500","Russell 2000"], ans: "S&P 500", tip: "The S&P 500 is widely considered the best gauge of the US stock market." },
  { q: "What is a 'bull market'?", opts: ["A falling market","A rising market","A stable market","A crash"], ans: "A rising market", tip: "A bull market = rising prices. A bear market = falling prices." },
  { q: "What percentage should you ideally save of your income?", opts: ["5%","10%","20%","50%"], ans: "20%", tip: "The 50/30/20 rule suggests 20% to savings/investments." },
  { q: "What is 'diversification' in investing?", opts: ["All in one stock","Spreading investments","Avoiding risk","Only buying bonds"], ans: "Spreading investments", tip: "Don't put all your eggs in one basket — spread across assets." },
  { q: "What is the '50/30/20' rule?", opts: ["Debt/savings/spending","Needs/wants/savings","Income/tax/expenses","Investment/risk/reward"], ans: "Needs/wants/savings", tip: "50% needs, 30% wants, 20% savings and investing." },
  { q: "Which is considered the safest investment?", opts: ["Individual stocks","Cryptocurrency","Government bonds","Startups"], ans: "Government bonds", tip: "Government bonds are low risk — backed by the government." },
  { q: "What is compound interest?", opts: ["Interest on the principal only","Interest on interest","A fixed fee","A type of tax"], ans: "Interest on interest", tip: "Einstein reportedly called compound interest the 8th wonder of the world." },
  { q: "What does 'liquid asset' mean?", opts: ["Easily converted to cash","A type of loan","A fixed property","An offshore account"], ans: "Easily converted to cash", tip: "Cash is the most liquid asset. Real estate is illiquid." },
  { q: "What is an ETF?", opts: ["A type of loan","Exchange-Traded Fund","Electronic Transfer Fee","Economic Tax Form"], ans: "Exchange-Traded Fund", tip: "ETFs track an index and trade on exchanges like stocks." },
  { q: "What is 'net worth'?", opts: ["Annual salary","Total savings","Assets minus liabilities","Monthly income"], ans: "Assets minus liabilities", tip: "Net worth = everything you own minus everything you owe." },
  { q: "What is the purpose of an emergency fund?", opts: ["For holidays","To cover 3–6 months of expenses","For investments","For luxury items"], ans: "To cover 3–6 months of expenses", tip: "An emergency fund protects you from unexpected costs or job loss." },
  { q: "What is inflation?", opts: ["Stock market rise","Increase in money supply","Rise in general price levels","Drop in wages"], ans: "Rise in general price levels", tip: "Inflation erodes purchasing power over time." },
  { q: "What does ROI stand for?", opts: ["Rate Of Interest","Return On Investment","Risk Of Insolvency","Reward Of Income"], ans: "Return On Investment", tip: "ROI = (Net Profit / Cost) × 100. The higher the better." },
  { q: "What is a budget?", opts: ["A loan agreement","A plan allocating income","A type of bond","A credit score"], ans: "A plan allocating income", tip: "A budget helps you control spending and reach financial goals." },
  { q: "What is the difference between gross and net income?", opts: ["Gross is after tax","Net is before tax","Gross is before tax, net is after","They are the same"], ans: "Gross is before tax, net is after", tip: "Net income is what you actually take home." },
  { q: "What is a credit score used for?", opts: ["To track spending","To rate borrowing risk","To calculate tax","To open a savings account"], ans: "To rate borrowing risk", tip: "Higher credit scores mean better loan rates." },
  { q: "Which account typically earns higher interest?", opts: ["Cheque account","Savings account","Credit card account","Current account"], ans: "Savings account", tip: "Savings accounts are designed to grow your money over time." },
  { q: "What is 'dollar-cost averaging'?", opts: ["Buying at the lowest price","Investing a fixed amount regularly","Avoiding volatile stocks","Timing the market"], ans: "Investing a fixed amount regularly", tip: "DCA removes emotion — you buy more shares when prices are low." },
  { q: "What does 'portfolio diversification' protect against?", opts: ["Guaranteed profits","Concentration risk","Inflation","Tax increases"], ans: "Concentration risk", tip: "If one investment tanks, diversification means others can offset the loss." },
  { q: "What is a dividend?", opts: ["A type of debt","Profit shared with shareholders","A government payment","A bank fee"], ans: "Profit shared with shareholders", tip: "Companies paying dividends distribute part of their profits to investors." },
  { q: "What does 'equity' mean in personal finance?", opts: ["Total debt","Value you own in an asset","Monthly repayment","Bank interest"], ans: "Value you own in an asset", tip: "Home equity = market value minus outstanding mortgage." },
  { q: "What is a stock?", opts: ["A type of bond","A loan to a company","Ownership share in a company","A government certificate"], ans: "Ownership share in a company", tip: "When you buy a stock, you become a part-owner of that company." },
  { q: "What does it mean to 'invest long-term'?", opts: ["Hold for one week","Hold for one month","Hold for 5+ years","Buy and sell daily"], ans: "Hold for 5+ years", tip: "Long-term investing reduces the impact of short-term market swings." },
  { q: "Which of these is a liability?", opts: ["Savings account","Car you own outright","Credit card debt","Investment property"], ans: "Credit card debt", tip: "Liabilities are what you owe. Assets are what you own." },
  { q: "What is a bond?", opts: ["A loan to a company or government","Ownership in a company","A savings account","A credit card"], ans: "A loan to a company or government", tip: "You lend money and receive interest in return — generally lower risk than stocks." },
  { q: "What is capital gains tax?", opts: ["Tax on income","Tax on profit from selling assets","Tax on purchases","Tax on savings interest"], ans: "Tax on profit from selling assets", tip: "CGT applies when you sell an asset for more than you paid." },
  { q: "What is an index fund?", opts: ["A fund managed by experts","A fund tracking a market index","A high-risk fund","A government bond"], ans: "A fund tracking a market index", tip: "Index funds are low-cost and often outperform actively managed funds." },
  { q: "What is financial literacy?", opts: ["Knowing how to read","Understanding money concepts","A degree in finance","Memorising tax laws"], ans: "Understanding money concepts", tip: "Financial literacy = the ability to make informed money decisions." },
  { q: "What is the main benefit of starting to invest early?", opts: ["Lower tax rates","More time for compound interest to grow","Better stock picks","Higher dividends"], ans: "More time for compound interest to grow", tip: "Starting at 20 vs 30 can mean double the wealth at retirement." },
];

// ── Finance: Invest or Save ────────────────────────────────────
const INVEST_QS = [
  { scenario: "You have $500 in an emergency fund and $200 spare. What do you do?", opts: ["Invest the $200","Save the $200 in emergency fund","Spend the $200","Lend it to a friend"], best: 1, reason: "Build your emergency fund to 3–6 months of expenses before investing." },
  { scenario: "You have no debt, 6 months emergency fund, and $1,000 spare.", opts: ["Put in savings at 2%","Invest long-term in index funds","Buy something nice","Lend it out"], best: 1, reason: "With a solid foundation, long-term index fund investing is the smart move." },
  { scenario: "You have a credit card at 20% interest. You have $500 spare.", opts: ["Invest it in stocks","Pay off the credit card","Save it at 3%","Donate it"], best: 1, reason: "20% interest is higher than most investment returns — eliminate that debt first." },
  { scenario: "You're 20 years old with $100 spare per month.", opts: ["Spend it all","Save it in a jar","Invest in index funds monthly","Wait until you earn more"], best: 2, reason: "Starting early with index funds gives compound interest decades to work its magic." },
  { scenario: "You receive a $5,000 bonus. Your emergency fund is full and you have no debt.", opts: ["Keep it in savings","Invest in a diversified portfolio","Spend it all","Lend it"], best: 1, reason: "With no debt and a full emergency fund, investing creates long-term wealth." },
  { scenario: "Your car needs $2,000 of repairs. You have $3,000 in investments.", opts: ["Sell investments to pay","Use the emergency fund","Take a loan","Ignore the repairs"], best: 1, reason: "Emergency funds exist for exactly this — avoid selling investments early." },
  { scenario: "You're offered a 401k with 5% employer match. You currently don't contribute.", opts: ["Don't bother","Contribute at least 5% to get match","Contribute 1%","Withdraw existing savings"], best: 1, reason: "Employer match is free money — not contributing is leaving salary on the table." },
  { scenario: "You have student loans at 6% interest and $200 spare monthly.", opts: ["Invest all $200","Split: pay extra on loans AND invest","Ignore loans","Only invest"], best: 1, reason: "At 6%, splitting between extra payments and investing is often optimal." },
  { scenario: "You want to buy a house in 2 years. You have $10,000 saved.", opts: ["Put it in stocks","Put it in a HYSA or bonds","Spend some now","Invest in crypto"], best: 1, reason: "For short-term goals (under 5 years), preserve capital — avoid volatile assets." },
  { scenario: "You inherit $50,000. Your finances are healthy with no debt.", opts: ["Spend it","Leave it in cash forever","Invest in diversified assets","Give it all away"], best: 2, reason: "Diversified long-term investing will make that $50k work for you over decades." },
  { scenario: "You're 55 and haven't started saving for retirement.", opts: ["It's too late","Start maxing out retirement accounts immediately","Invest in high-risk stocks","Only save a little"], best: 1, reason: "It's never too late. Maximise contributions and consider bonds for stability." },
  { scenario: "Your friend offers you a guaranteed 30% monthly return investment.", opts: ["Invest everything","Invest a little","Decline — it's a scam","Ask for more details"], best: 2, reason: "30% monthly returns are mathematically impossible legitimately. Classic scam pattern." },
  { scenario: "You have $1,000 and want to start investing. Which is lowest risk?", opts: ["Individual tech stocks","Cryptocurrency","S&P 500 index fund","Single company bond"], best: 2, reason: "Index funds spread risk across 500 companies — much safer than individual stocks." },
  { scenario: "Your savings account earns 1%. Inflation is at 4%. What should you do?", opts: ["Leave it","Move money to higher-yield savings or investments","Withdraw everything","Take a loan"], best: 1, reason: "At 1% with 4% inflation, your money is losing value in real terms." },
  { scenario: "You want to save for your child's college in 15 years. You have $200/month.", opts: ["Keep in cash","Invest in a 529 or education fund","Buy bonds only","Don't save yet"], best: 1, reason: "A 529 plan offers tax advantages and 15 years is long enough to handle market risk." },
  { scenario: "You have $0 savings and land a new job. First priority?", opts: ["Invest immediately","Build 3 months emergency fund first","Buy new things","Pay off any debt first"], best: 1, reason: "Emergency fund before investing. Job loss or emergencies will otherwise derail you." },
  { scenario: "You have credit card debt at 24% and a mortgage at 4%. Which to pay off first?", opts: ["Mortgage","Credit card","Both equally","Neither"], best: 1, reason: "Always tackle highest-interest debt first. 24% guaranteed return by paying it off." },
  { scenario: "You can afford $500/month for investments. How should you invest?", opts: ["All in one stock","Spread across diversified funds","All in cash","Only in gold"], best: 1, reason: "Diversified funds reduce risk while capturing broad market growth." },
  { scenario: "The stock market drops 30%. You're 25 and investing long-term. What do you do?", opts: ["Sell everything","Buy more — it's on sale","Panic and withdraw","Convert to cash"], best: 1, reason: "Market dips are buying opportunities for long-term investors. Stay the course." },
  { scenario: "You're deciding between paying off a 3% mortgage or investing. Market returns ~7%.", opts: ["Always pay off mortgage","Invest — 7% > 3%","Do both equally","Neither"], best: 1, reason: "When investment returns exceed debt interest, investing often wins mathematically." },
];

// ── Finance: Money Math ────────────────────────────────────────
const MONEY_QS = [
  { q: "You earn $3,200/month. 20% goes to savings. How much is saved?", ans: "640", display: "$640" },
  { q: "An item costs $80, on 25% off. What's the price?", ans: "60", display: "$60" },
  { q: "$1,000 invested at 10% annually. After 2 years (compound)?", ans: "1210", display: "$1,210" },
  { q: "You spend $45/week on coffee. Cost per year?", ans: "2340", display: "$2,340" },
  { q: "Salary is $60,000. Tax rate 30%. Take-home per month?", ans: "3500", display: "$3,500" },
  { q: "You owe $5,000 at 20% annual interest. Interest cost after 1 year?", ans: "1000", display: "$1,000" },
  { q: "Item costs $150. Sale price is 40% off. What do you pay?", ans: "90", display: "$90" },
  { q: "You save $200/month for 12 months. Total saved?", ans: "2400", display: "$2,400" },
  { q: "Rent is $1,200/month. Annual cost?", ans: "14400", display: "$14,400" },
  { q: "$500 at 5% simple interest for 3 years. Interest earned?", ans: "75", display: "$75" },
  { q: "Monthly income $4,000. 50% to needs. Monthly needs budget?", ans: "2000", display: "$2,000" },
  { q: "You invest $100/month for 10 months. No interest. Total?", ans: "1000", display: "$1,000" },
  { q: "Item was $200, now $160. What percentage discount?", ans: "20", display: "20%" },
  { q: "Electricity costs $1.20/day. Monthly cost (30 days)?", ans: "36", display: "$36" },
  { q: "You earn $25/hour, work 8 hours/day, 5 days/week. Weekly pay?", ans: "1000", display: "$1,000" },
  { q: "Loan $10,000 at 6% annual interest. Interest in year 1?", ans: "600", display: "$600" },
  { q: "Net salary $3,500. Rent $1,050 (30%). How much left?", ans: "2450", display: "$2,450" },
  { q: "You spend $8/day on lunch. Cost over 20 working days?", ans: "160", display: "$160" },
  { q: "Save $250/month for 24 months. Total before interest?", ans: "6000", display: "$6,000" },
  { q: "Item costs $75 + 10% tax. Total price?", ans: "83", display: "$82.50 ≈ $83" },
  { q: "Annual salary $48,000. Monthly gross pay?", ans: "4000", display: "$4,000" },
  { q: "Budget $500. Spent 70%. Remaining?", ans: "150", display: "$150" },
  { q: "Invest $2,000 for 1 year at 8% compound. Final value?", ans: "2160", display: "$2,160" },
  { q: "Phone plan $45/month, annual cost?", ans: "540", display: "$540" },
  { q: "You have $800. Spend 35% on food. How much is left?", ans: "520", display: "$520" },
];

// ── Demeanor: Speak It ─────────────────────────────────────────
const SPEAK_QS = [
  { scenario: "Your boss asks for your opinion in a meeting.", opts: ["'I'm not sure...'","'Well, maybe if...'","'My view is clear: here's what I recommend.'","'Others probably know better.'"], best: 2, why: "Confident, direct, and solution-focused." },
  { scenario: "Someone challenges your idea publicly.", opts: ["Go silent","Apologise immediately","'That's a fair point. Here's why I still believe...'","Agree with everything they say"], best: 2, why: "Acknowledging but holding your ground shows emotional intelligence." },
  { scenario: "You need to ask for a pay rise.", opts: ["Wait for them to offer","Drop hints","'Based on my contributions, I'd like to discuss my salary.'","Ask a colleague to ask for you"], best: 2, why: "Direct, evidence-based requests are respected." },
  { scenario: "You're introducing yourself to a new group.", opts: ["Say as little as possible","Ramble nervously","State your name, role, and one interesting fact clearly","Wait for someone to ask"], best: 2, why: "Clarity and confidence in introductions sets the tone immediately." },
  { scenario: "You disagree with a colleague's plan in a team meeting.", opts: ["Say nothing","Roll your eyes","'I see where you're going, but I'd like to suggest an alternative.'","Interrupt and say they're wrong"], best: 2, why: "Disagreeing respectfully with a solution shows maturity and leadership." },
  { scenario: "You're running late to an important meeting.", opts: ["Just arrive late and say nothing","Blame traffic extensively","Send a quick message with your ETA and apology","Pretend it didn't happen"], best: 2, why: "A brief, early notification shows respect for others' time." },
  { scenario: "A colleague takes credit for your work.", opts: ["Complain behind their back","Say nothing","Calmly and privately address it: 'I'd appreciate being credited for that.'","Send an angry email"], best: 2, why: "Private, direct feedback resolves it without public conflict." },
  { scenario: "You don't understand what someone just said.", opts: ["Nod and pretend","Laugh awkwardly","'Could you clarify that? I want to make sure I understand correctly.'","Walk away"], best: 2, why: "Asking for clarification shows confidence, not weakness." },
  { scenario: "You're asked to present unexpectedly.", opts: ["Refuse","Panic and mumble","Take a breath, structure your thoughts, and begin clearly","Apologise and stumble through"], best: 2, why: "A calm pause before speaking always sounds more confident." },
  { scenario: "Someone talks over you repeatedly in a meeting.", opts: ["Give up speaking","Get angry","'I'd like to finish my point — it's relevant to what you're discussing.'","Speak louder over them"], best: 2, why: "Asserting your right to speak without aggression is the mark of a confident communicator." },
  { scenario: "You receive critical feedback on your work.", opts: ["Get defensive immediately","Dismiss it","'Thank you. Can you help me understand what I can do differently?'","Apologise excessively"], best: 2, why: "Turning feedback into a learning question shows growth mindset." },
  { scenario: "You want to leave a conversation politely.", opts: ["Abruptly walk away","Make up an excuse","'It's been great chatting — I'll let you go. Let's catch up again soon.'","Keep talking until they leave"], best: 2, why: "A clean, warm exit respects both parties' time." },
  { scenario: "Your presentation has a technical issue mid-way through.", opts: ["Panic visibly","Apologise repeatedly","Stay calm, make a light comment, and continue confidently","End the presentation"], best: 2, why: "How you handle problems under pressure defines your presence." },
  { scenario: "Someone asks you a question you don't know the answer to.", opts: ["Make something up","Go red and freeze","'I don't have that at hand right now — I'll find out and get back to you.'","Change the subject"], best: 2, why: "Acknowledging gaps and following up is more credible than guessing." },
  { scenario: "You want to give someone constructive criticism.", opts: ["Email a list of faults","Post it in a group chat","'I've noticed X. I think if you tried Y, it could really strengthen your work.'","Say nothing to avoid conflict"], best: 2, why: "Specific, private, actionable feedback is the most effective form of criticism." },
  { scenario: "A client is unhappy with a result.", opts: ["Blame your team","Ignore the complaint","'I understand your frustration. Let me explain what happened and how we'll fix it.'","Get defensive"], best: 2, why: "Ownership + solution = trust rebuilt." },
  { scenario: "You need to end a phone call that's gone on too long.", opts: ["Hang up suddenly","Keep talking","'I want to respect your time — let's wrap up and I'll send a follow-up email.'","Talk over them"], best: 2, why: "Framing the exit around their time is considerate and polished." },
  { scenario: "You want someone to stop interrupting you.", opts: ["Speak faster","Shout louder","'Just a moment — let me finish this thought.'","Give up your point"], best: 2, why: "A calm, polite hold-on signal is firm without being rude." },
  { scenario: "You're asked to speak about your strengths in an interview.", opts: ["Downplay everything","List every skill ever","Name two concrete strengths with a real example each","Say 'I'm just hardworking'"], best: 2, why: "Specific evidence beats vague claims every time in an interview." },
  { scenario: "You want to compliment someone's work genuinely.", opts: ["Say nothing","Send a generic emoji","Name exactly what impressed you: 'The way you structured that argument was exceptionally clear.'","Exaggerate wildly"], best: 2, why: "Specific compliments land far more powerfully than general praise." },
];

// ── Demeanor: Filler Catcher ───────────────────────────────────
const FILLER_TEXTS = [
  {
    text: "So, basically, I was like going to the meeting and um, I kind of presented the, you know, report and it was like really good actually.",
    fillers: ["So","basically","like","um","kind","you","know","actually"],
  },
  {
    text: "I think, sort of, the project is literally going well and we're basically, um, hitting our targets so yeah.",
    fillers: ["sort","literally","basically","um","yeah"],
  },
  {
    text: "Right, so, I'm going to just explain how this works. It's like, very, um, straightforward, right.",
    fillers: ["Right","so","just","like","very","um","right"],
  },
  {
    text: "Honestly, I just feel like we should, you know, kind of revisit the plan and, um, basically start over.",
    fillers: ["Honestly","just","like","you","know","kind","um","basically"],
  },
  {
    text: "To be honest, like, the feedback was sort of mixed, and I guess we need to, um, rethink things, right?",
    fillers: ["like","sort","guess","um","right"],
  },
  {
    text: "I literally cannot believe how, uh, amazing the results actually turned out, you know what I mean?",
    fillers: ["literally","uh","actually","you","know"],
  },
  {
    text: "So basically what happened was, I kind of forgot to, like, send the email and, um, yeah, that was my bad.",
    fillers: ["So","basically","kind","like","um","yeah"],
  },
  {
    text: "The thing is, right, we just need to, sort of, figure out where we stand and, like, move forward.",
    fillers: ["right","just","sort","like"],
  },
  {
    text: "I mean, I guess we could try, like, a different approach, and um, see if that, you know, helps.",
    fillers: ["guess","like","um","you","know"],
  },
  {
    text: "Essentially, basically, what I'm trying to say is that, um, we should, like, reconsider our options.",
    fillers: ["Essentially","basically","um","like"],
  },
  {
    text: "Yeah, so, the presentation went, like, really well and the client was, um, very impressed, actually.",
    fillers: ["Yeah","so","like","um","actually"],
  },
  {
    text: "So I was thinking, right, that we could maybe, sort of, collaborate more and, like, share ideas.",
    fillers: ["right","maybe","sort","like"],
  },
  {
    text: "I just, um, wanted to, like, check in and see if, you know, everything was going alright.",
    fillers: ["just","um","like","you","know"],
  },
  {
    text: "To be fair, literally, the team has been, um, working super hard and, basically, deserves recognition.",
    fillers: ["literally","um","basically"],
  },
  {
    text: "So, like, the main issue is that, basically, nobody is, um, taking ownership, you know what I mean?",
    fillers: ["like","basically","um","you","know"],
  },
];

// ── Demeanor: Tone Detector ────────────────────────────────────
const TONE_QS = [
  { message: "I need this done NOW. No excuses.", tones: ["Professional","Aggressive","Enthusiastic","Polite"], ans: "Aggressive", tip: "Caps and ultimatums signal aggression, not urgency." },
  { message: "Hey! Just wanted to check in and see how things are going 😊", tones: ["Aggressive","Formal","Friendly","Sarcastic"], ans: "Friendly", tip: "Warm, casual language with an emoji signals friendly intent." },
  { message: "Per my last email, I clearly outlined the requirements.", tones: ["Passive-aggressive","Enthusiastic","Empathetic","Direct"], ans: "Passive-aggressive", tip: "'Per my last email' is a classic passive-aggressive phrase." },
  { message: "Thank you for bringing this to my attention. I'll look into it promptly.", tones: ["Dismissive","Professional","Sarcastic","Casual"], ans: "Professional", tip: "Acknowledges, commits, and stays formal — textbook professional." },
  { message: "Oh great, another meeting that could've been an email.", tones: ["Sarcastic","Enthusiastic","Empathetic","Neutral"], ans: "Sarcastic", tip: "The 'oh great' and contrast signals obvious sarcasm." },
  { message: "I understand this has been frustrating. Let's work through it together.", tones: ["Aggressive","Dismissive","Empathetic","Formal"], ans: "Empathetic", tip: "Acknowledging feelings and offering to help is the core of empathy." },
  { message: "Fine. Do whatever you want.", tones: ["Supportive","Passive-aggressive","Enthusiastic","Professional"], ans: "Passive-aggressive", tip: "'Fine' here is dismissal disguised as agreement — classic passive aggression." },
  { message: "As per our discussion, please ensure this is completed by EOD.", tones: ["Casual","Aggressive","Formal","Sarcastic"], ans: "Formal", tip: "'As per', 'EOD' — business shorthand signals a formal, professional tone." },
  { message: "I just wanted to say — you absolutely crushed that presentation!", tones: ["Sarcastic","Formal","Enthusiastic","Neutral"], ans: "Enthusiastic", tip: "'Crushed it' and the exclamation point are unmistakably enthusiastic." },
  { message: "If you actually read the brief, you'd know the answer.", tones: ["Empathetic","Supportive","Passive-aggressive","Professional"], ans: "Passive-aggressive", tip: "'If you actually' implies a put-down while avoiding direct conflict." },
  { message: "Would it be possible to revisit this point when you have a moment?", tones: ["Aggressive","Polite","Sarcastic","Dismissive"], ans: "Polite", tip: "Hedged question, respectful phrasing — polite and considerate." },
  { message: "Not my problem. Ask someone else.", tones: ["Casual","Empathetic","Dismissive","Professional"], ans: "Dismissive", tip: "Shutting someone down without offering a path forward is dismissive." },
  { message: "I think we might want to consider a slightly different approach here.", tones: ["Direct","Diplomatic","Sarcastic","Aggressive"], ans: "Diplomatic", tip: "'Might want to consider' softens the suggestion — diplomatic and careful." },
  { message: "This is unacceptable. I expect better from this team.", tones: ["Motivational","Empathetic","Authoritative","Sarcastic"], ans: "Authoritative", tip: "Clear expectations without personal attack — firm and authoritative." },
  { message: "Great job, everyone! The results speak for themselves 🎉", tones: ["Sarcastic","Enthusiastic","Formal","Passive-aggressive"], ans: "Enthusiastic", tip: "Genuine praise + emoji + exclamation = enthusiastic celebration." },
  { message: "I'm sorry you feel that way.", tones: ["Empathetic","Passive-aggressive","Sincere","Formal"], ans: "Passive-aggressive", tip: "'I'm sorry you feel that way' dismisses the emotion without owning anything." },
  { message: "Could you walk me through your reasoning on this?", tones: ["Aggressive","Curious","Sarcastic","Dismissive"], ans: "Curious", tip: "Open, non-judgmental request for explanation — genuinely curious." },
  { message: "We need to talk. My office. Now.", tones: ["Casual","Threatening","Empathetic","Formal"], ans: "Threatening", tip: "No context, command structure, and 'now' create a threatening tone." },
  { message: "I wanted to share some feedback — feel free to take it or leave it!", tones: ["Passive-aggressive","Casual","Aggressive","Formal"], ans: "Casual", tip: "Relaxed delivery, no pressure — a casual, easy-going tone." },
  { message: "Your dedication hasn't gone unnoticed. Keep it up.", tones: ["Sarcastic","Dismissive","Encouraging","Formal"], ans: "Encouraging", tip: "Recognition + forward-looking encouragement = a motivating, warm tone." },
];

// ── Demeanor: Confidence Quiz ──────────────────────────────────
const CONF_QUIZ = [
  { q: "When someone disagrees with you publicly, you...", opts: ["Immediately back down","Get defensive","Listen, then calmly explain your view","Stay silent and stew"], scores: [0,1,3,1] },
  { q: "When you walk into a room of strangers, you...", opts: ["Hug the walls","Wait to be approached","Introduce yourself to someone","Check your phone"], scores: [0,1,3,1] },
  { q: "When you make a mistake, you...", opts: ["Catastrophise","Blame others","Acknowledge, learn, move on","Avoid the topic forever"], scores: [0,0,3,0] },
  { q: "When asked to speak impromptu, you...", opts: ["Panic","Deflect to someone else","Take a breath and speak clearly","Speak fast and nervous"], scores: [0,0,3,1] },
  { q: "Your posture right now is...", opts: ["Slumped","Closed/crossed arms","Open and upright","Neck craned down"], scores: [0,1,3,0] },
  { q: "When you receive a compliment, you...", opts: ["Deflect and minimise it","Say nothing","Accept it warmly: 'Thank you, I appreciate that.'","Laugh it off nervously"], scores: [0,0,3,1] },
  { q: "Before an important conversation, you...", opts: ["Wing it completely","Rehearse the whole thing word for word","Know your key points and stay flexible","Avoid the conversation altogether"], scores: [0,1,3,0] },
  { q: "When you don't know something in a conversation, you...", opts: ["Fake confidence and guess","Freeze up","Say 'I don't know — let me find out.' ","Change the subject"], scores: [0,0,3,1] },
  { q: "When someone interrupts you, you...", opts: ["Stop talking immediately","Get angry","Politely hold your ground and finish your point","Lose your train of thought and give up"], scores: [0,1,3,0] },
  { q: "Your default eye contact in conversations is...", opts: ["Avoiding it almost entirely","Staring intensely","Natural, comfortable — mostly maintained","Looking everywhere else"], scores: [0,1,3,0] },
  { q: "When entering a new space (office, party, event), you...", opts: ["Stay near the exit","Wait for someone to notice you","Scan the room, smile, and move toward someone","Check your phone immediately"], scores: [0,0,3,1] },
  { q: "When setting a boundary, you...", opts: ["Apologise for having one","Hint at it and hope they get it","State it clearly and without over-explanation","Avoid the topic entirely"], scores: [0,0,3,0] },
  { q: "After a difficult conversation, you...", opts: ["Replay it anxiously for hours","Pretend it didn't happen","Reflect briefly, note what went well, and move on","Blame yourself entirely"], scores: [0,0,3,0] },
  { q: "When presenting in front of others, your breathing is...", opts: ["Fast and shallow","You hold your breath","Slow and deliberate — you pause intentionally","You don't think about it at all"], scores: [0,0,3,1] },
  { q: "Your speaking volume in group conversations is...", opts: ["Too quiet — people ask you to repeat","Loud to compensate for nerves","Measured and clear — you modulate naturally","Inconsistent depending on topic"], scores: [0,1,3,1] },
];

// ── Demeanor: Body Language IQ ─────────────────────────────────
const BODY_QS = [
  { q: "Crossed arms typically signal...", opts: ["Confidence","Openness","Defensiveness or discomfort","Excitement"], ans: "Defensiveness or discomfort", tip: "Crossed arms create a physical barrier between you and others." },
  { q: "Sustained eye contact (not staring) communicates...", opts: ["Aggression","Confidence and trustworthiness","Dishonesty","Boredom"], ans: "Confidence and trustworthiness", tip: "Eye contact shows you're engaged and have nothing to hide." },
  { q: "Mirroring someone's body language usually...", opts: ["Annoys them","Builds rapport unconsciously","Shows dominance","Signals boredom"], ans: "Builds rapport unconsciously", tip: "Mirroring is a natural signal of alignment and empathy." },
  { q: "A slow, steady nod while listening suggests...", opts: ["You're bored","Disagreement","Active listening and comprehension","Impatience"], ans: "Active listening and comprehension", tip: "Slow nods signal you're processing and engaged, not just waiting to talk." },
  { q: "Touching your face frequently during a conversation often signals...", opts: ["Confidence","Engagement","Anxiety or uncertainty","Happiness"], ans: "Anxiety or uncertainty", tip: "Self-touching is a self-soothing behaviour — notice it and reduce it." },
  { q: "Leaning slightly forward during a conversation signals...", opts: ["Threat","Engagement and interest","Aggression","Boredom"], ans: "Engagement and interest", tip: "A forward lean shows you're interested in what the other person is saying." },
  { q: "Standing with feet shoulder-width apart communicates...", opts: ["Weakness","Nervousness","Stability and confidence","Aggression"], ans: "Stability and confidence", tip: "A grounded stance signals you're comfortable and self-assured." },
  { q: "Rapid blinking often indicates...", opts: ["Deep focus","Calm confidence","Stress or anxiety","Dishonesty"], ans: "Stress or anxiety", tip: "Blink rate increases when the nervous system is activated." },
  { q: "A firm handshake (not crushing) signals...", opts: ["Aggression","Confidence and professionalism","Nervousness","Indifference"], ans: "Confidence and professionalism", tip: "A limp handshake signals weakness; a crusher signals aggression. Firm is ideal." },
  { q: "Avoiding eye contact when speaking typically signals...", opts: ["Confidence","Creativity","Lack of confidence or dishonesty","Being polite"], ans: "Lack of confidence or dishonesty", tip: "Whether nervous or hiding something, avoiding eye contact reduces trust." },
  { q: "Open palms while speaking generally signal...", opts: ["Aggression","Secrecy","Honesty and openness","Confusion"], ans: "Honesty and openness", tip: "Showing your palms is a universally understood trust signal." },
  { q: "Fidgeting with objects during a conversation typically shows...", opts: ["Interest","Authority","Nervousness or distraction","Confidence"], ans: "Nervousness or distraction", tip: "Fidgeting draws attention away from your words and signals discomfort." },
  { q: "Tilting your head slightly while listening signals...", opts: ["Dominance","Curiosity and empathy","Disagreement","Boredom"], ans: "Curiosity and empathy", tip: "A head tilt shows you're genuinely interested and trying to understand." },
  { q: "Standing too close to someone in conversation...", opts: ["Builds connection","Signals confidence","Can feel invasive and aggressive","Shows you're friendly"], ans: "Can feel invasive and aggressive", tip: "Personal space (1–1.5m for acquaintances) should be respected." },
  { q: "Steepling your fingers (fingertips touching) typically conveys...", opts: ["Nervousness","Expertise and authority","Agreement","Boredom"], ans: "Expertise and authority", tip: "The steeple is a high-confidence gesture associated with authority." },
  { q: "Turning your body away from someone while talking signals...", opts: ["You're relaxed","Engagement","Disinterest or desire to leave","Deep thought"], ans: "Disinterest or desire to leave", tip: "Feet and body direction reveal where you really want to go." },
  { q: "Smiling with only your mouth (not your eyes) is called a...", opts: ["Genuine smile","Duchenne smile","Polite or fake smile","Confident smile"], ans: "Polite or fake smile", tip: "A real smile (Duchenne) involves the eyes. Mouth-only smiles lack warmth." },
  { q: "Slumped posture in a professional setting typically signals...", opts: ["Confidence","Approachability","Low energy or disengagement","Relaxation"], ans: "Low energy or disengagement", tip: "Posture affects how others perceive you — and how you feel about yourself." },
  { q: "Keeping your chin slightly up while speaking projects...", opts: ["Arrogance","Shyness","Confidence and openness","Aggression"], ans: "Confidence and openness", tip: "Chin down makes you appear smaller. Chin up (not too far) shows assurance." },
  { q: "Crossing your legs away from someone during a conversation signals...", opts: ["Comfort","Deep interest","Closed off or disinterested","Respect"], ans: "Closed off or disinterested", tip: "Like crossed arms, leg direction reveals emotional orientation." },
];

// ── English: Word Ladder Puzzles ──────────────────────────────
const WORD_LADDER_PUZZLES = [
  { start: "CAT", end: "DOG", steps: ["CAT","COT","COG","DOG"] },
  { start: "HOT", end: "COD", steps: ["HOT","HOG","COG","COD"] },
  { start: "COLD", end: "WARM", steps: ["COLD","CORD","WORD","WARD","WARM"] },
  { start: "BAKE", end: "BITE", steps: ["BAKE","BIKE","BITE"] },
  { start: "BOOK", end: "COOL", steps: ["BOOK","COOK","COOL"] },
  { start: "FARM", end: "FIRM", steps: ["FARM","FORM","FIRM"] },
  { start: "FIND", end: "FINE", steps: ["FIND","FINE"] },
  { start: "MINE", end: "WINE", steps: ["MINE","WINE"] },
  { start: "SALE", end: "TALE", steps: ["SALE","TALE"] },
  { start: "HEAT", end: "HEAD", steps: ["HEAT","BEAT","BEAN","LEAN","LEAD","HEAD"] },
  { start: "COME", end: "LINE", steps: ["COME","SOME","SAME","SANE","LANE","LINE"] },
  { start: "FIRE", end: "CORE", steps: ["FIRE","HIRE","HERE","HARE","CARE","CORE"] },
  { start: "RING", end: "MINE", steps: ["RING","KING","KIND","FIND","FINE","MINE"] },
  { start: "FAST", end: "BASE", steps: ["FAST","LAST","LASH","CASH","CASE","BASE"] },
  { start: "DARK", end: "BORE", steps: ["DARK","BARK","BARE","CARE","CORE","BORE"] },
  { start: "BACK", end: "DICE", steps: ["BACK","RACK","RACE","RICE","MICE","DICE"] },
  { start: "LOVE", end: "TILE", steps: ["LOVE","LIVE","LINE","LIME","TIME","TILE"] },
  { start: "PLAY", end: "SWIM", steps: ["PLAY","CLAY","CLAM","SLAM","SLIM","SWIM"] },
  { start: "HAND", end: "LAND", steps: ["HAND","BAND","LAND"] },
  { start: "MAKE", end: "LAKE", steps: ["MAKE","LAKE"] },
  { start: "WORD", end: "WARD", steps: ["WORD","WARD"] },
  { start: "BOLD", end: "COLD", steps: ["BOLD","COLD"] },
  { start: "BEAR", end: "DEAR", steps: ["BEAR","DEAR"] },
  { start: "FIVE", end: "LIVE", steps: ["FIVE","LIVE"] },
  { start: "HATE", end: "LATE", steps: ["HATE","LATE"] },
  { start: "MICE", end: "RICE", steps: ["MICE","RICE"] },
  { start: "PALE", end: "MALE", steps: ["PALE","MALE"] },
  { start: "CAPE", end: "TAPE", steps: ["CAPE","TAPE"] },
  { start: "CAKE", end: "WAKE", steps: ["CAKE","WAKE"] },
  { start: "ROPE", end: "ROLE", steps: ["ROPE","ROLE"] },
];

/* ──────────────────────────────────────────────────────────────
   FLIP CARD COMPONENT
────────────────────────────────────────────────────────────── */
function FlipCard({ game, color, lightColor, borderColor, index, onPlay }) {
  const [flipped, setFlipped] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 65);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      style={{
        perspective: "1000px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(16px) scale(0.94)",
        transition: `opacity 0.35s ease ${index * 65}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${index * 65}ms`,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1.05",
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
          cursor: "pointer",
        }}
        onClick={() => setFlipped(!flipped)}
      >
        {/* FRONT */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          background: "rgba(255,255,255,0.045)",
          border: `1px solid ${borderColor}`,
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 14px 34px",
          gap: 10,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 4px 20px rgba(0,0,0,0.15)`,
        }}>
          {/* Type badge */}
          <div style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "3px 8px",
            borderRadius: 999,
            background: lightColor,
            border: `1px solid ${borderColor}`,
            fontSize: 9,
            fontWeight: 700,
            color: color,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            fontFamily: FONT,
          }}>
            {game.type}
          </div>

          <div style={{ fontSize: 32, lineHeight: 1 }}>{game.icon}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#ededed", textAlign: "center", fontFamily: FONT, letterSpacing: "-0.02em" }}>
            {game.title}
          </div>
          <div style={{
            fontSize: 12,
            color: "rgba(161,161,161,0.7)",
            textAlign: "center",
            lineHeight: 1.5,
            fontFamily: FONT,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            padding: "0 4px",
          }}>
            {game.desc}
          </div>

          {/* Tap hint — subtle pulsing dot, Apple-style */}
          <div
            aria-hidden="true"
            className="life-flipcard-hint"
            style={{
              position: "absolute",
              bottom: 10,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: color,
                boxShadow: `0 0 0 0 ${color}`,
                animation: "life-flipcard-hint-pulse 1.8s ease-in-out infinite",
              }}
            />
            <span style={{
              fontSize: 9.5,
              color: color,
              fontFamily: FONT,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: 0.55,
            }}>flip</span>
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg)",
          background: `linear-gradient(160deg, ${lightColor.replace("0.12","0.18")} 0%, rgba(255,255,255,0.04) 100%)`,
          border: `1.5px solid ${color}60`,
          borderRadius: 22,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 14px",
          gap: 12,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: `0 4px 28px ${color}25`,
        }}>
          <div style={{ fontSize: 28 }}>{game.icon}</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#ededed", textAlign: "center", fontFamily: FONT }}>
            Ready to play?
          </div>
          <div style={{ fontSize: 11.5, color: "rgba(161,161,161,0.7)", textAlign: "center", lineHeight: 1.5, fontFamily: FONT }}>
            {game.desc}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onPlay(game.id); }}
            style={{
              marginTop: 4,
              padding: "11px 24px",
              background: color,
              color: "#000",
              border: "none",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: FONT,
              letterSpacing: "-0.01em",
              boxShadow: `0 4px 16px ${color}40`,
              transition: "transform 0.15s cubic-bezier(0.34,1.56,0.64,1)",
              WebkitTapHighlightColor: "transparent",
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.94)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            ▶ Play
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   GAME MODAL WRAPPER
────────────────────────────────────────────────────────────── */
function GameModal({ children, onClose, color, title, t, play }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: `radial-gradient(ellipse at 70% 20%, ${color}0a 0%, transparent 60%), ${t?.skin || "#0a0a0a"}`,
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes gmBgSweep {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes questionIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fillGapShake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-7px); }
          40%,80% { transform: translateX(7px); }
        }
        @keyframes correctBurst {
          0%   { opacity: 0; transform: translateY(-20px) scale(0.6); }
          40%  { opacity: 1; transform: translateY(4px) scale(1.08); }
          70%  { transform: translateY(0) scale(1); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tipSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tileFlip {
          0%   { transform: scaleY(1); }
          50%  { transform: scaleY(0); }
          100% { transform: scaleY(1); }
        }
        @keyframes streakPop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes timerRingAnim {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 188; }
        }
        @keyframes popIn {
          0%   { transform: scale(0.85); opacity: 0; }
          60%  { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes rowShake {
          0%,100% { transform: translateX(0); }
          15%,45%,75% { transform: translateX(-8px); }
          30%,60%,90% { transform: translateX(8px); }
        }
        @keyframes bounceTile {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-12px); }
        }
        @keyframes roundComplete {
          0%   { opacity: 0; transform: scale(0.7) translateY(-20px); }
          60%  { opacity: 1; transform: scale(1.05) translateY(4px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes scoreRing {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%     { transform: scale(1.12); opacity: 0; }
        }
        @keyframes confettiFall {
          0%   { transform: translateY(-40px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(220px) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: `1px solid ${color}30`,
        background: t?.white || "#111111",
      }}>
        <button
          type="button"
          onClick={() => { play?.("back"); onClose(); }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: color || t?.green,
            fontSize: 16,
            fontWeight: 600,
            fontFamily: FONT,
            padding: 0,
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
          Back
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", marginLeft: "-50px" }}>
          <div style={{ width: 3, height: 20, borderRadius: 999, background: color, flexShrink: 0 }} />
          <span style={{ fontSize: 17, fontWeight: 700, color: t?.ink || "#ededed", fontFamily: FONT, letterSpacing: "-0.02em" }}>{title}</span>
        </div>
        <div style={{ width: 50 }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {children}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   INDIVIDUAL GAMES
────────────────────────────────────────────────────────────── */

function FillGapGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [options, setOptions] = useState(FILL_GAP_QS[0].options);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showCorrect, setShowCorrect] = useState(false);
  const q = FILL_GAP_QS[qi];

  useEffect(() => {
    setOptions(FILL_GAP_QS[qi]?.options || []);
    setHintUsed(false);
  }, [qi]);

  useEffect(() => {
    setTimeLeft(15);
  }, [qi]);

  useEffect(() => {
    if (selected || done) return;
    if (timeLeft <= 0) {
      setStreak(0);
      const p = play;
      p?.("wrong");
      setTimeout(() => {
        if (qi + 1 >= FILL_GAP_QS.length) setDone(true);
        else { setQi(q2 => q2 + 1); setSelected(null); setTimeLeft(15); }
      }, 400);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, selected, done, qi, play]);

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.answer) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      play?.("correct");
      setShowCorrect(true);
      setTimeout(() => setShowCorrect(false), 700);
    } else {
      setStreak(0);
      setShake(true);
      setTimeout(() => setShake(false), 400);
      play?.("wrong");
    }
    setTimeout(() => {
      if (qi + 1 >= FILL_GAP_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={FILL_GAP_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setStreak(0); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      {showCorrect && (
        <div style={{
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, pointerEvents: "none",
          background: `${color}dd`, borderRadius: 999,
          padding: "8px 20px", fontSize: 16, fontWeight: 800, color: "#000",
          animation: "correctBurst 0.55s cubic-bezier(0.34,1.56,0.64,1) both",
          fontFamily: FONT,
        }}>✓ Correct!</div>
      )}
      {/* Timer ring */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", width: 64, height: 64 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke={t?.border||"rgba(255,255,255,0.1)"} strokeWidth="4" />
            <circle cx="32" cy="32" r="28" fill="none"
              stroke={timeLeft <= 5 ? "#e5484d" : timeLeft <= 8 ? "#f59e0b" : color}
              strokeWidth="4"
              strokeDasharray="176"
              strokeDashoffset={`${176 - (timeLeft / 15) * 176}`}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, fontWeight: 800, color: timeLeft <= 5 ? "#e5484d" : timeLeft <= 8 ? "#f59e0b" : color,
            fontFamily: FONT, transition: "color 0.3s ease",
          }}>{timeLeft}</div>
        </div>
      </div>
      <Progress current={qi} total={FILL_GAP_QS.length} color={color} t={t} />
      {streak >= 3 && (
        <div style={{ textAlign: "right", marginTop: -14, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", fontFamily: FONT, animation: "streakPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>🔥 ×{streak} streak!</span>
        </div>
      )}
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "22px 18px", marginBottom: 22, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: shake ? "fillGapShake 0.35s ease" : "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0, fontWeight: 500, letterSpacing: "-0.01em" }}>
          {q.sentence.replace("___", "______")}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {options.map(opt => {
          const isCorrect = opt === q.answer;
          const isWrong = selected === opt && !isCorrect;
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 12px",
              borderRadius: 16,
              border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected ? isCorrect ? `${color}18` : isWrong ? "rgba(229,72,77,0.12)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
              color: selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.muted || "#a1a1a1" : t?.ink || "#ededed",
              fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {!selected && !hintUsed && (
        <button type="button" onClick={() => {
          play?.("tap");
          setHintUsed(true);
          const wrongs = q.options.filter(o => o !== q.answer);
          const keep = wrongs[Math.floor(Math.random() * wrongs.length)];
          setOptions([q.answer, keep].sort(() => Math.random() - 0.5));
        }} style={{
          display: "block", margin: "12px auto 0", padding: "8px 18px",
          background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1",
          border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
          borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: "pointer",
          fontFamily: FONT, WebkitTapHighlightColor: "transparent",
        }}>💡 Hint (removes 2 options)</button>
      )}
    </div>
  );
}

const KB_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["ENTER","Z","X","C","V","B","N","M","⌫"],
];

function WordGuessGame({ color, t, play }) {
  const [target] = useState(() => WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
  const [guesses, setGuesses] = useState([]);
  const [current, setCurrent] = useState("");
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [shakeRow, setShakeRow] = useState(false);
  const maxGuesses = 6;

  const submit = () => {
    if (current.length !== 5) {
      setShakeRow(true);
      setTimeout(() => setShakeRow(false), 400);
      return;
    }
    const g = current.toUpperCase();
    const next = [...guesses, g];
    setGuesses(next);
    setCurrent("");
    play?.("tap");
    if (g === target) { setWon(true); play?.("correct"); }
    else if (next.length >= maxGuesses) { setLost(true); play?.("wrong"); }
  };

  const getLetterState = (letter, pos, word) => {
    if (word[pos] === letter) return "correct";
    if (target.includes(letter)) return "present";
    return "absent";
  };

  const letterStates = (() => {
    const states = {};
    guesses.forEach(g => {
      g.split("").forEach((l, i) => {
        const cur = states[l];
        if (target[i] === l) { states[l] = "correct"; }
        else if (target.includes(l) && cur !== "correct") { states[l] = "present"; }
        else if (!target.includes(l) && cur !== "correct" && cur !== "present") { states[l] = "absent"; }
      });
    });
    return states;
  })();

  const tapKey = (key) => {
    if (won || lost) return;
    if (key === "⌫") { setCurrent(c => c.slice(0, -1)); play?.("tap"); }
    else if (key === "ENTER") { submit(); }
    else if (current.length < 5) { setCurrent(c => c + key); play?.("tap"); }
  };

  const keyStyle = (k) => {
    const s = letterStates[k];
    const isWide = k === "ENTER" || k === "⌫";
    return {
      minWidth: isWide ? 52 : 34, height: 44, borderRadius: 8,
      background: s === "correct" ? color : s === "present" ? "#f59e0b" : s === "absent" ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.08)",
      color: s === "correct" || s === "present" ? "#000" : t?.ink || "#ededed",
      border: "none", fontSize: isWide ? 10 : 14, fontWeight: 700,
      cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent",
      transition: "background 0.2s ease",
      flexShrink: 0,
    };
  };

  const reset = () => { setGuesses([]); setCurrent(""); setWon(false); setLost(false); setShakeRow(false); };

  if (won || lost) {
    const guessCount = guesses.length;
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 24 }}>
          {target.split("").map((l, i) => (
            <div key={i} style={{
              width: 52, height: 52, borderRadius: 12,
              background: won ? `${color}25` : "rgba(255,255,255,0.08)",
              border: `2px solid ${won ? color : "rgba(255,255,255,0.2)"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 800, color: won ? color : t?.ink||"#ededed",
              fontFamily: FONT,
              animation: won ? `bounceTile 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 100}ms both` : "none",
            }}>{l}</div>
          ))}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t?.ink||"#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>
          {won ? "🎉 You Got It!" : "Better luck next time"}
        </div>
        {won && <div style={{ fontSize: 14, color: t?.muted||"#a1a1a1", marginBottom: 8 }}>Solved in {guessCount} guess{guessCount !== 1 ? "es" : ""}!</div>}
        {!won && <div style={{ fontSize: 15, color: t?.muted||"#a1a1a1", marginBottom: 24 }}>The word was <strong style={{ color }}>{target}</strong></div>}
        {won && (
          <div style={{ display: "inline-flex", padding: "6px 18px", borderRadius: 999, background: `${color}18`, border: `1px solid ${color}40`, fontSize: 14, color, fontWeight: 700, marginBottom: 24 }}>
            {guessCount === 1 ? "Hole in one! 🌟" : guessCount <= 3 ? "Impressive! ⚡" : guessCount <= 5 ? "Well played! 👏" : "Just made it! 🎯"}
          </div>
        )}
        <button type="button" onClick={reset} style={{
          padding: "14px 36px", background: color, color: "#000", borderRadius: 14,
          border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
          boxShadow: `0 4px 20px ${color}40`,
        }}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <p style={{ textAlign: "center", fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Guess the 5-letter word in {maxGuesses} tries</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16, alignItems: "center" }}>
        {Array.from({ length: maxGuesses }).map((_, ri) => {
          const g = guesses[ri] || "";
          const isCompleted = ri < guesses.length;
          return (
            <div key={ri} style={{
              display: "flex", gap: 6,
              animation: ri === guesses.length && shakeRow ? "rowShake 0.4s ease both" : "none",
            }}>
              {Array.from({ length: 5 }).map((_, ci) => {
                const l = g[ci] || (ri === guesses.length ? current[ci] : "");
                const state = g[ci] ? getLetterState(g[ci], ci, g) : "empty";
                return (
                  <div key={ci} style={{
                    width: 52, height: 52, borderRadius: 12,
                    border: `2px solid ${state === "correct" ? color : state === "present" ? "#f59e0b" : state === "absent" ? "rgba(255,255,255,0.15)" : ri === guesses.length && l ? `${color}90` : ri === guesses.length ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.15)"}`,
                    background: state === "correct" ? `${color}25` : state === "present" ? "rgba(245,158,11,0.2)" : state === "absent" ? "rgba(255,255,255,0.06)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: state === "correct" ? color : state === "present" ? "#f59e0b" : t?.ink || "#ededed",
                    fontFamily: FONT, transition: "all 0.2s ease",
                    animation: ri === guesses.length && l && !isCompleted ? "popIn 0.15s cubic-bezier(0.34,1.56,0.64,1) both" : isCompleted && g[ci] ? `tileFlip 0.4s ease ${ci * 0.08}s both` : "none",
                  }}>{l}</div>
                );
              })}
            </div>
          );
        })}
      </div>
      <input
        type="text" maxLength={5}
        value={current}
        onChange={(e) => setCurrent(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
        readOnly
      />
      <div style={{ marginTop: 8 }}>
        {KB_ROWS.map((row, ri) => (
          <div key={ri} style={{ display: "flex", justifyContent: "center", gap: 5, marginBottom: 6 }}>
            {row.map(k => (
              <button key={k} type="button" onClick={() => tapKey(k)} style={keyStyle(k)}>{k}</button>
            ))}
          </div>
        ))}
      </div>
      <p style={{ textAlign: "center", fontSize: 12, color: t?.muted || "#a1a1a1", marginTop: 8 }}>{guesses.length}/{maxGuesses} guesses</p>
    </div>
  );
}

function VocabMatchGame({ color, onClose, t, play }) {
  const ROUND_SIZE = 6;
  const totalRounds = Math.ceil(VOCAB_PAIRS.length / ROUND_SIZE);
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState({ word: null, def: null });
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [roundComplete, setRoundComplete] = useState(false);

  const roundPairs = VOCAB_PAIRS.slice(round * ROUND_SIZE, (round + 1) * ROUND_SIZE);
  const [roundDefsMap] = useState(() => {
    const map = [];
    for (let r = 0; r < Math.ceil(VOCAB_PAIRS.length / 6); r++) {
      const pairs = VOCAB_PAIRS.slice(r * 6, (r + 1) * 6);
      map.push([...pairs.map(p => p.def)].sort(() => Math.random() - 0.5));
    }
    return map;
  });
  const roundDefs = roundDefsMap[round] || [...roundPairs.map(p => p.def)].sort(() => Math.random() - 0.5);
  const roundWords = roundPairs.map(p => p.word);
  const roundMatched = matched.filter(w => roundWords.includes(w));

  useEffect(() => {
    if (done) return;
    if (roundMatched.length === roundPairs.length) return;
    if (timeLeft <= 0) {
      if (round + 1 >= totalRounds) { setDone(true); return; }
      setTimeout(() => { setRound(r => r + 1); setTimeLeft(30); setSelected({ word: null, def: null }); }, 400);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, done, round, roundMatched.length, roundPairs.length, totalRounds]);

  useEffect(() => {
    if (roundMatched.length === roundPairs.length && roundPairs.length > 0) {
      setRoundComplete(true);
      setTimeout(() => {
        setRoundComplete(false);
        if (round + 1 >= totalRounds) { setDone(true); }
        else { setRound(r => r + 1); setTimeLeft(30); setSelected({ word: null, def: null }); }
      }, 1400);
    }
  }, [roundMatched.length, roundPairs.length, round, totalRounds]);

  const pick = (type, val) => {
    play?.("tap");
    const next = { ...selected, [type]: val };
    setSelected(next);
    if (next.word && next.def) {
      setMoves(m => m + 1);
      const pair = VOCAB_PAIRS.find(p => p.word === next.word);
      if (pair?.def === next.def) {
        play?.("correct");
        const newMatched = [...matched, next.word];
        setMatched(newMatched);
        setSelected({ word: null, def: null });
      } else {
        play?.("wrong");
        setWrong(true);
        setTimeout(() => { setWrong(false); setSelected({ word: null, def: null }); }, 700);
      }
    }
  };

  if (done) return <ScoreScreen score={matched.length} total={VOCAB_PAIRS.length} color={color} customMsg={`Matched ${matched.length} in ${moves} moves!`} onReplay={() => { setRound(0); setSelected({ word: null, def: null }); setMatched([]); setWrong(false); setDone(false); setMoves(0); setTimeLeft(30); }} onClose={onClose} t={t} play={play} />;

  const btnStyle = (active, isMatched) => ({
    padding: "11px 12px", borderRadius: 12, border: `1.5px solid ${isMatched ? `${color}40` : active ? color : wrong && active ? "#e5484d" : "rgba(255,255,255,0.1)"}`,
    background: isMatched ? `${color}10` : active ? `${color}18` : wrong && active ? "rgba(229,72,77,0.15)" : "rgba(255,255,255,0.04)",
    color: isMatched ? `${color}80` : active ? color : t?.ink || "#ededed",
    fontSize: 12.5, fontWeight: 600, cursor: isMatched ? "default" : "pointer",
    fontFamily: FONT, textAlign: "left", lineHeight: 1.4,
    transition: "all 0.2s ease", WebkitTapHighlightColor: "transparent",
    opacity: isMatched ? 0.5 : 1,
  });

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, position: "relative" }}>
      {roundComplete && (
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
          zIndex: 20, pointerEvents: "none", textAlign: "center",
          animation: "roundComplete 0.45s cubic-bezier(0.34,1.56,0.64,1) both",
          background: `${color}ee`, borderRadius: 20, padding: "20px 32px",
          boxShadow: `0 8px 40px ${color}60`,
          minWidth: 200,
        }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#000", fontFamily: FONT }}>Round Complete!</div>
          <div style={{ fontSize: 13, color: "rgba(0,0,0,0.7)", fontFamily: FONT, marginTop: 4 }}>
            {round + 1 < totalRounds ? `Round ${round + 2} starting…` : "Final round!"}
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: t?.ink || "#ededed", fontFamily: FONT }}>Round {round + 1} of {totalRounds}</span>
        <div style={{ padding: "5px 12px", borderRadius: 999, background: timeLeft <= 8 ? "rgba(229,72,77,0.15)" : `${color}15`, border: `1px solid ${timeLeft <= 8 ? "#e5484d40" : color + "40"}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: timeLeft <= 8 ? "#e5484d" : color, fontFamily: FONT }}>{timeLeft}s</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 12 }}>
        {Array.from({ length: totalRounds }).map((_, i) => (
          <div key={i} style={{
            width: i === round ? 20 : 8, height: 8, borderRadius: 999,
            background: i < round ? color : i === round ? color : t?.border||"rgba(255,255,255,0.15)",
            transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Words</p>
          {roundWords.map(w => (
            <button key={w} type="button" onClick={() => !matched.includes(w) && pick("word", w)} style={btnStyle(selected.word === w, matched.includes(w))}>{w}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Definitions</p>
          {roundDefs.map(d => {
            const matchedWord = VOCAB_PAIRS.find(p => p.def === d && matched.includes(p.word));
            return (
              <button key={d} type="button" onClick={() => !matchedWord && pick("def", d)} style={btnStyle(selected.def === d, !!matchedWord)}>{d}</button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SentenceBuilderGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [firstTry, setFirstTry] = useState(true);
  const q = SENTENCE_QS[qi];
  const [shuffled] = useState(() => SENTENCE_QS.map(sentenceQ => [...sentenceQ.words].sort(() => Math.random() - 0.5)));
  const [built, setBuilt] = useState([]);
  const [remaining, setRemaining] = useState(shuffled[0]);
  const [result, setResult] = useState(null);

  const addWord = (word, idx) => {
    if (result) return;
    play?.("tap");
    setBuilt(b => [...b, word]);
    setRemaining(r => r.filter((_, i) => i !== idx));
  };

  const removeWord = (idx) => {
    if (result) return;
    play?.("tap");
    setFirstTry(false);
    const word = built[idx];
    setBuilt(b => b.filter((_, i) => i !== idx));
    setRemaining(r => [...r, word]);
  };

  const check = () => {
    const correct = JSON.stringify(built) === JSON.stringify(q.answer);
    setResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => s + (firstTry ? 2 : 1));
      play?.("correct");
      setTimeout(() => {
        if (qi + 1 >= SENTENCE_QS.length) setDone(true);
        else { setQi(qi + 1); setBuilt([]); setRemaining(shuffled[qi + 1]); setResult(null); setFirstTry(true); }
      }, 1000);
    } else {
      play?.("wrong");
    }
  };

  if (done) return <ScoreScreen score={score} total={SENTENCE_QS.length * 2} color={color} onReplay={() => { setQi(0); setScore(0); setDone(false); setBuilt([]); setRemaining(shuffled[0]); setResult(null); setFirstTry(true); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={SENTENCE_QS.length} color={color} t={t} />
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, color,
          textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: FONT,
          padding: "4px 12px", borderRadius: 999,
          background: `${color}15`, border: `1px solid ${color}30`,
        }}>📌 {q.hint}</span>
      </div>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 16 }}>Tap words to build the sentence in the correct order</p>
      {/* Built area */}
      <div style={{ minHeight: 64, background: "rgba(255,255,255,0.04)", borderRadius: 16, border: `2px dashed ${result === "correct" ? color : result === "wrong" ? "#e5484d" : "rgba(255,255,255,0.12)"}`, padding: "12px 14px", marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 8, transition: "border-color 0.2s ease" }}>
        {built.map((w, i) => (
          <button key={i} type="button" onClick={() => removeWord(i)} style={{ padding: "7px 12px", borderRadius: 999, background: `${color}22`, border: `1px solid ${color}60`, color, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>{w}</button>
        ))}
        {built.length === 0 && <span style={{ color: "rgba(161,161,161,0.35)", fontSize: 13 }}>Tap words below…</span>}
      </div>
      {/* Shuffle + Word bank */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <button type="button" onClick={() => { play?.("tap"); setRemaining(r => [...r].sort(() => Math.random() - 0.5)); }} style={{ padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1", border: `1px solid ${t?.border || "rgba(255,255,255,0.1)"}`, fontSize: 12, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>⇄ Shuffle</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {remaining.map((w, i) => (
          <button key={i} type="button" onClick={() => addWord(w, i)} style={{ padding: "9px 14px", borderRadius: 999, background: t?.light || "rgba(255,255,255,0.07)", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, color: t?.ink || "#ededed", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent" }}>{w}</button>
        ))}
      </div>
      {firstTry && remaining.length === 0 && result === null && (
        <p style={{ textAlign: "center", fontSize: 11.5, color: color, fontWeight: 700, marginBottom: 6, fontFamily: FONT }}>✨ First try bonus active!</p>
      )}
      <button type="button" onClick={check} disabled={remaining.length > 0} style={{ width: "100%", padding: "14px", background: remaining.length > 0 ? "rgba(255,255,255,0.06)" : color, color: remaining.length > 0 ? "#a1a1a1" : "#000", borderRadius: 14, border: "none", fontSize: 15, fontWeight: 700, cursor: remaining.length > 0 ? "not-allowed" : "pointer", fontFamily: FONT, transition: "all 0.2s ease" }}>
        Check Sentence
      </button>
      {result === "wrong" && (
        <button type="button" onClick={() => {
          play?.("tap");
          setBuilt([]);
          setRemaining(shuffled[qi]);
          setResult(null);
          setFirstTry(false);
        }} style={{ width: "100%", marginTop: 10, padding: "13px", background: "rgba(255,255,255,0.06)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>↺ Try Again</button>
      )}
      {result === "correct" && (
        <div style={{
          marginTop: 12, padding: "12px 16px", borderRadius: 14,
          background: `${color}15`, border: `1px solid ${color}40`,
          fontSize: 14, color, fontWeight: 600, fontFamily: FONT,
          textAlign: "center", animation: "tipSlideUp 0.3s ease both",
          lineHeight: 1.6,
        }}>✓ &ldquo;{q.answer.join(" ")}&rdquo;</div>
      )}
    </div>
  );
}

function MultiChoiceGame({ questions, color, onClose, t, play }) {
  const QUIZ_TIME = 12;
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUIZ_TIME);
  const q = questions[qi];
  const multiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;

  useEffect(() => {
    setTimeLeft(QUIZ_TIME);
  }, [qi]);

  useEffect(() => {
    if (selected || done) return;
    if (timeLeft <= 0) {
      setSelected("__timeout__");
      setStreak(0);
      setTimeout(() => {
        if (qi + 1 >= questions.length) setDone(true);
        else { setQi(q2 => q2 + 1); setSelected(null); }
      }, 900);
      return;
    }
    const t2 = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t2);
  }, [timeLeft, selected, done, qi, questions.length]);

  const pick = (opt) => {
    if (selected) return;
    setSelected(opt);
    if (opt === q.ans) {
      setScore(s => s + multiplier);
      setStreak(s => s + 1);
      play?.("correct");
    } else {
      setStreak(0);
      play?.("wrong");
    }
    setTimeout(() => {
      if (qi + 1 >= questions.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 900);
  };

  if (done) return <ScoreScreen score={score} total={questions.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setStreak(0); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={questions.length} color={color} t={t} />
      {multiplier > 1 && (
        <div style={{ textAlign: "right", marginBottom: 8 }}>
          <span style={{
            fontSize: multiplier === 3 ? 18 : 14, fontWeight: 700, color: "#f59e0b",
            fontFamily: FONT, animation: "streakPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both",
            display: "inline-block",
          }}>
            {"🔥".repeat(multiplier - 1)} ×{multiplier} Multiplier!
          </span>
        </div>
      )}
      {/* Question timer bar */}
      <div style={{ height: 4, borderRadius: 999, background: t?.border||"rgba(255,255,255,0.1)", marginBottom: 16, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 999,
          background: timeLeft <= 4 ? "#e5484d" : timeLeft <= 7 ? "#f59e0b" : color,
          width: `${(timeLeft / QUIZ_TIME) * 100}%`,
          transition: "width 0.9s linear, background 0.3s ease",
        }} />
      </div>
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px 18px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map(opt => {
          const isCorrect = opt === q.ans;
          const isWrong = selected === opt && !isCorrect;
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected ? isCorrect ? `${color}18` : isWrong ? "rgba(229,72,77,0.12)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
              color: selected ? isCorrect ? color : isWrong ? "#e5484d" : "#666" : t?.ink || "#ededed",
              fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: FONT,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>{opt}</button>
          );
        })}
      </div>
      {selected && q.tip && (
        <div style={{
          marginTop: 14, padding: "12px 16px", borderRadius: 14,
          background: `${color}10`, border: `1px solid ${color}30`,
          fontSize: 12.5, color: color, lineHeight: 1.55, fontFamily: FONT,
          animation: "tipSlideUp 0.32s cubic-bezier(0.34,1.56,0.64,1) both",
        }}>{q.tip}</div>
      )}
    </div>
  );
}

function FlashcardGame({ cards, color, t, play }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [seen, setSeen] = useState(new Set());
  const card = cards[i];

  const next = () => {
    play?.("ok");
    setSeen(s => new Set([...s, i]));
    setFlipped(false);
    setTimeout(() => setI(n => (n + 1) % cards.length), 150);
  };

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT, textAlign: "center" }}>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 20 }}>Tap to flip · {seen.size}/{cards.length} seen</p>
      <div style={{ perspective: "1200px", marginBottom: 20 }}>
        <div
          onClick={() => { play?.("tap"); setFlipped(!flipped); }}
          style={{
            height: 220, position: "relative",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.34,1.56,0.64,1)",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            cursor: "pointer",
          }}
        >
          {/* Front */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            background: t?.light || "#1a1a1a",
            border: `1.5px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
            borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>Term</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", margin: 0, letterSpacing: "-0.02em" }}>{card.term}</p>
            <p style={{ fontSize: 12, color: t?.muted || "rgba(161,161,161,0.5)", marginTop: 16 }}>Tap to reveal definition</p>
          </div>
          {/* Back */}
          <div style={{
            position: "absolute", inset: 0,
            backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: `${color}14`,
            border: `1.5px solid ${color}60`,
            borderRadius: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "28px 24px",
            boxShadow: `0 8px 40px ${color}30`,
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>Definition</p>
            <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0, fontWeight: 400 }}>{card.def}</p>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={() => { setI(n => (n - 1 + cards.length) % cards.length); setFlipped(false); }} style={{ flex: 1, padding: "13px", background: t?.light || "rgba(255,255,255,0.07)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT }}>← Prev</button>
        <button type="button" onClick={next} style={{ flex: 1, padding: "13px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Next →</button>
      </div>
    </div>
  );
}

function BudgetGame({ color, t, play }) {
  const categories = ["Housing","Food","Transport","Entertainment","Savings","Healthcare"];
  const [budget] = useState(3000);
  const [alloc, setAlloc] = useState({ Housing: 900, Food: 450, Transport: 300, Entertainment: 150, Savings: 600, Healthcare: 150 });
  const total = Object.values(alloc).reduce((a, b) => a + b, 0);
  const remaining = budget - total;

  const ideal = { Housing: [25,35], Food: [10,15], Transport: [10,15], Entertainment: [5,10], Savings: [20,25], Healthcare: [5,10] };

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "18px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 12, color: t?.muted || "#a1a1a1", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>Monthly Budget</p>
        <p style={{ fontSize: 28, fontWeight: 800, color: t?.ink || "#ededed", margin: 0, letterSpacing: "-0.03em" }}>${budget.toLocaleString()}</p>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <span style={{ fontSize: 13, color: t?.muted || "#a1a1a1" }}>Allocated: <strong style={{ color: remaining < 0 ? "#e5484d" : t?.ink || "#ededed" }}>${total}</strong></span>
          <span style={{ fontSize: 13, color: remaining < 0 ? "#e5484d" : color, fontWeight: 600 }}>Remaining: ${remaining}</span>
        </div>
        <div style={{ marginTop: 10, height: 6, borderRadius: 999, background: t?.light || "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{ width: `${Math.min((total / budget) * 100, 100)}%`, height: "100%", background: remaining < 0 ? "#e5484d" : color, borderRadius: 999, transition: "width 0.3s ease" }} />
        </div>
      </div>
      {categories.map(cat => {
        const pct = Math.round((alloc[cat] / budget) * 100);
        const [min, max] = ideal[cat];
        const ok = pct >= min && pct <= max;
        return (
          <div key={cat} style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: t?.ink || "#ededed" }}>{cat}</span>
              <span style={{ fontSize: 13, color: ok ? color : "#f59e0b", fontWeight: 600 }}>${alloc[cat]} ({pct}%) {ok ? "✓" : "⚠"}</span>
            </div>
            <input type="range" min={0} max={budget} step={50} value={alloc[cat]}
              onChange={e => {
                const v = +e.target.value;
                setAlloc(a => {
                  const [mi, ma] = ideal[cat];
                  const pctNew = Math.round((v / budget) * 100);
                  const pctOld = Math.round((a[cat] / budget) * 100);
                  if (pctNew >= mi && pctNew <= ma && !(pctOld >= mi && pctOld <= ma)) play?.("star");
                  return { ...a, [cat]: v };
                });
              }}
              style={{ width: "100%", accentColor: ok ? color : "#f59e0b" }}
            />
            <p style={{ fontSize: 10, color: "rgba(161,161,161,0.5)", margin: "3px 0 0" }}>Ideal: {min}–{max}% of income</p>
          </div>
        );
      })}
    </div>
  );
}

function InvestSaveGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const q = INVEST_QS[qi];

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.best) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= INVEST_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 1400);
  };

  if (done) return <ScoreScreen score={score} total={INVEST_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={INVEST_QS.length} color={color} t={t} />
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Scenario</p>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.scenario}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => {
          const isBest = idx === q.best;
          const isPicked = selected === idx;
          return (
            <button key={idx} type="button" onClick={() => pick(idx)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected !== null ? isBest ? color : isPicked ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected !== null ? isBest ? `${color}18` : isPicked ? "rgba(229,72,77,0.12)" : "transparent" : t?.light || "rgba(255,255,255,0.05)",
              color: selected !== null ? isBest ? color : isPicked ? "#e5484d" : "#555" : t?.ink || "#ededed",
              fontSize: 14, cursor: "pointer", fontFamily: FONT, fontWeight: 500,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
            }}>{opt}</button>
          );
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55 }}>{q.reason}</div>}
    </div>
  );
}

function MoneyMathGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = MONEY_QS[qi];

  const check = () => {
    const correct = input.replace(/[^0-9]/g, "") === q.ans;
    setResult(correct ? "correct" : "wrong");
    if (correct) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= MONEY_QS.length) setDone(true);
      else { setQi(qi + 1); setInput(""); setResult(null); }
    }, 1200);
  };

  if (done) return <ScoreScreen score={score} total={MONEY_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setInput(""); setResult(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={MONEY_QS.length} color={color} t={t} />
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.q}</p>
      </div>
      {result && <div style={{ textAlign: "center", fontSize: 15, color: result === "correct" ? color : "#e5484d", fontWeight: 700, marginBottom: 12 }}>{result === "correct" ? "✓ Correct! " + q.display : `✗ Answer: ${q.display}`}</div>}
      <div style={{ display: "flex", gap: 10 }}>
        <input type="number" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Your answer ($)"
          style={{ flex: 1, padding: "13px 16px", borderRadius: 14, background: t?.light || "rgba(255,255,255,0.07)", border: `1.5px solid ${result === "correct" ? color : result === "wrong" ? "#e5484d" : t?.border || "rgba(255,255,255,0.15)"}`, color: t?.ink || "#ededed", fontSize: 16, outline: "none", fontFamily: FONT }} />
        <button type="button" onClick={check} style={{ padding: "13px 20px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Check</button>
      </div>
    </div>
  );
}

// ── Finance: Compound Growth ───────────────────────────────────
const COMPOUND_QS = [
  { principal: 1000, rate: 10, years: 2, ans: "$1,210", display: "$1,210", opts: ["$1,100", "$1,210", "$1,200", "$1,020"] },
  { principal: 5000, rate: 8,  years: 3, ans: "$6,298", display: "$6,298", opts: ["$6,200", "$6,298", "$5,800", "$6,500"] },
  { principal: 2000, rate: 6,  years: 5, ans: "$2,676", display: "$2,676", opts: ["$2,600", "$2,800", "$2,676", "$2,300"] },
  { principal: 10000, rate: 7, years: 4, ans: "$13,108", display: "$13,108", opts: ["$12,800", "$13,400", "$13,108", "$14,000"] },
  { principal: 500,  rate: 12, years: 3, ans: "$702",   display: "$702",   opts: ["$680", "$720", "$702", "$660"] },
];

function CompoundGrowthGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);

  const q = COMPOUND_QS[qi];

  useEffect(() => {
    if (selected !== null || done) return;
    if (timeLeft <= 0) {
      setSelected("__timeout__");
      play?.("wrong");
      setTimeout(() => {
        if (qi + 1 >= COMPOUND_QS.length) setDone(true);
        else { setQi(qi + 1); setSelected(null); setTimeLeft(15); }
      }, 1200);
      return;
    }
    const id = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, selected, done, qi, play]);

  const pick = (opt) => {
    if (selected !== null) return;
    setSelected(opt);
    const correct = opt === q.ans;
    if (correct) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= COMPOUND_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); setTimeLeft(15); }
    }, 1200);
  };

  if (done) return <ScoreScreen score={score} total={COMPOUND_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); setTimeLeft(15); }} onClose={onClose} t={t} play={play} />;

  const urgentColor = timeLeft <= 5 ? "#e5484d" : timeLeft <= 8 ? "#f59e0b" : color;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={COMPOUND_QS.length} color={color} t={t} />
      {/* Timer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontSize: 12, color: t?.muted || "#a1a1a1", fontFamily: FONT }}>Compound Interest</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: urgentColor, boxShadow: `0 0 8px ${urgentColor}`, transition: "all 0.3s ease" }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: urgentColor, fontFamily: FONT, transition: "color 0.3s ease", minWidth: 24, textAlign: "right" }}>{timeLeft}s</span>
        </div>
      </div>
      {/* Question card */}
      <div style={{ background: t?.light || "#1a1a1a", borderRadius: 20, padding: "22px 18px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14, textAlign: "center" }}>
          {[
            { label: "Principal", val: `$${q.principal.toLocaleString()}` },
            { label: "Rate / yr", val: `${q.rate}%` },
            { label: "Years", val: `${q.years}y` },
          ].map(({ label, val }) => (
            <div key={label} style={{ background: `${color}12`, borderRadius: 12, padding: "10px 6px", border: `1px solid ${color}30` }}>
              <div style={{ fontSize: 9, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 17, fontWeight: 800, color: t?.ink || "#ededed", letterSpacing: "-0.02em" }}>{val}</div>
            </div>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: t?.muted || "#a1a1a1", textAlign: "center", fontFamily: FONT }}>What is the final value? (compound interest)</p>
      </div>
      {/* Options */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {q.opts.map(opt => {
          const isCorrect = opt === q.ans;
          const isWrong = selected === opt && !isCorrect;
          return (
            <button key={opt} type="button" onClick={() => pick(opt)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
                padding: "16px 10px", borderRadius: 16, fontFamily: FONT,
                border: `1.5px solid ${selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
                background: selected ? isCorrect ? `${color}20` : isWrong ? "rgba(229,72,77,0.15)" : t?.light || "rgba(255,255,255,0.03)" : t?.light || "rgba(255,255,255,0.05)",
                color: selected ? isCorrect ? color : isWrong ? "#e5484d" : t?.muted || "#a1a1a1" : t?.ink || "#ededed",
                fontSize: 17, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.01em",
                transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)",
                WebkitTapHighlightColor: "transparent",
              }}
            >{opt.startsWith("$") ? opt : `$${opt}`}</button>
          );
        })}
      </div>
      {selected && selected !== "__timeout__" && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color, lineHeight: 1.55, fontFamily: FONT }}>
          Formula: Principal × (1 + rate)^years = {q.display}
        </div>
      )}
      {selected === "__timeout__" && (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: "rgba(229,72,77,0.12)", border: "1px solid #e5484d40", fontSize: 12.5, color: "#e5484d", lineHeight: 1.55, fontFamily: FONT }}>
          Time&apos;s up! Answer: {q.display}
        </div>
      )}
    </div>
  );
}

function SpeakItGame({ color, onClose, t, play }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const q = SPEAK_QS[qi];

  const pick = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.best) { setScore(s => s + 1); play?.("correct"); }
    else play?.("wrong");
    setTimeout(() => {
      if (qi + 1 >= SPEAK_QS.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 1400);
  };

  if (done) return <ScoreScreen score={score} total={SPEAK_QS.length} color={color} onReplay={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={SPEAK_QS.length} color={color} t={t} />
      <div key={qi} style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, animation: "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Situation</p>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{q.scenario}</p>
      </div>
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 12 }}>What do you say?</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => {
          const isBest = idx === q.best;
          const isPicked = selected === idx;
          return (
            <button key={idx} type="button" onClick={() => pick(idx)}
              onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              style={{
              padding: "14px 16px", borderRadius: 14, textAlign: "left",
              border: `1.5px solid ${selected !== null ? isBest ? color : isPicked ? "#e5484d" : t?.border || "rgba(255,255,255,0.07)" : t?.border || "rgba(255,255,255,0.1)"}`,
              background: selected !== null ? isBest ? `${color}18` : isPicked ? "rgba(229,72,77,0.12)" : "transparent" : t?.light || "rgba(255,255,255,0.05)",
              color: selected !== null ? isBest ? color : isPicked ? "#e5484d" : "#555" : t?.ink || "#ededed",
              fontSize: 13.5, cursor: "pointer", fontFamily: FONT, fontWeight: 400,
              transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", fontStyle: "italic",
            }}>{opt}</button>
          );
        })}
      </div>
      {selected !== null && <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 14, background: `${color}10`, border: `1px solid ${color}30`, fontSize: 12.5, color: color, lineHeight: 1.55 }}>{q.why}</div>}
    </div>
  );
}

function FillerCatcherGame({ color, onClose, t, play }) {
  const [ti, setTi] = useState(0);
  const [tapped, setTapped] = useState(new Set());
  const [score, setScore] = useState(0);
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState(false);
  const filler = FILLER_TEXTS[ti];
  const words = filler.text.split(" ");

  const toggle = (word) => {
    if (checked) return;
    play?.("tap");
    setTapped(prev => {
      const next = new Set(prev);
      if (next.has(word)) next.delete(word);
      else next.add(word);
      return next;
    });
  };

  const checkAnswers = () => {
    setChecked(true);
    play?.("ok");
    const correct = filler.fillers.filter(f => tapped.has(f)).length;
    const wrong = [...tapped].filter(w => !filler.fillers.includes(w)).length;
    setScore(s => s + Math.max(0, correct - wrong));
    setTimeout(() => {
      if (ti + 1 >= FILLER_TEXTS.length) setDone(true);
      else { setTi(ti + 1); setTapped(new Set()); setChecked(false); }
    }, 1800);
  };

  if (done) return <ScoreScreen score={score} total={FILLER_TEXTS.reduce((a, f) => a + f.fillers.length, 0)} color={color} customMsg="Filler words found!" onReplay={() => { setTi(0); setTapped(new Set()); setScore(0); setChecked(false); setDone(false); }} onClose={onClose} t={t} play={play} />;

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={ti} total={FILLER_TEXTS.length} color={color} t={t} />
      <p style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 16 }}>Tap every filler word (um, like, basically, etc.)</p>
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}`, lineHeight: 2.2, display: "flex", flexWrap: "wrap", gap: "0 4px" }}>
        {words.map((word, i) => {
          const clean = word.replace(/[^a-zA-Z]/g, "");
          const isTapped = tapped.has(clean) || tapped.has(word);
          const isFiller = checked && filler.fillers.includes(clean);
          const isWrong = checked && isTapped && !isFiller;
          return (
            <button key={i} type="button" onClick={() => toggle(clean || word)} style={{
              background: checked ? isFiller ? `${color}25` : isWrong ? "rgba(229,72,77,0.2)" : "transparent" : isTapped ? `${color}20` : "transparent",
              border: `1px solid ${isTapped || (checked && isFiller) ? checked ? isFiller ? color : "#e5484d" : color : "transparent"}`,
              borderRadius: 6, padding: "1px 4px", cursor: "pointer",
              color: checked ? isFiller ? color : isWrong ? "#e5484d" : t?.ink || "#ededed" : isTapped ? color : t?.ink || "#ededed",
              fontSize: 16, lineHeight: 1.8, fontFamily: FONT,
              transition: "all 0.15s ease", WebkitTapHighlightColor: "transparent",
            }}>{word}</button>
          );
        })}
      </div>
      {!checked && (
        <button type="button" onClick={checkAnswers} style={{ width: "100%", padding: "14px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Check My Answers</button>
      )}
    </div>
  );
}

function ConfidenceQuiz({ color, t, play }) {
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);
  const q = CONF_QUIZ[qi];
  const maxScore = CONF_QUIZ.reduce((a, q) => a + Math.max(...q.scores), 0);

  const pick = (idx) => {
    if (selected !== null) return;
    play?.("ok");
    setSelected(idx);
    setScore(s => s + q.scores[idx]);
    setTimeout(() => {
      if (qi + 1 >= CONF_QUIZ.length) setDone(true);
      else { setQi(qi + 1); setSelected(null); }
    }, 700);
  };

  if (done) {
    const pct = Math.round((score / maxScore) * 100);
    const label = pct >= 80 ? "Highly Confident" : pct >= 55 ? "Growing Confident" : "Building Foundation";
    const iconPath = pct >= 80
      ? <><path d="M6 9a6 6 0 0012 0V4H6v5z"/><path d="M6 4H3v3a3 3 0 003 3"/><path d="M18 4h3v3a3 3 0 01-3 3"/><path d="M9 21h6"/><path d="M12 15v6"/></>
      : pct >= 55
        ? <><circle cx="12" cy="12" r="10"/><polyline points="16,10 11,15 8,12"/></>
        : <><path d="M11 20A7 7 0 014 13c0-5 4-9 9-11 0 5 2 9 2 11a4 4 0 01-4 7z"/><path d="M11 20c0-5.5 5-9 7-9"/></>;
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: `${color}15`, border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{iconPath}</svg>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t?.ink || "#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>{label}</div>
        <div style={{ fontSize: 16, color, fontWeight: 700, marginBottom: 24 }}>Score: {pct}%</div>
        <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 16, padding: "16px 20px", textAlign: "left", marginBottom: 24, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
          <p style={{ color: t?.ink || "#ededed", fontSize: 14, lineHeight: 1.65, margin: 0 }}>
            {pct >= 80 ? "You carry yourself with genuine confidence. Keep practising direct communication and expanding your comfort zone." : pct >= 55 ? "You're building strong confidence habits. Focus on posture, eye contact, and speaking up earlier in conversations." : "Confidence is a skill — and you're developing it. Start with small wins: introduce yourself first, speak up in small groups, maintain eye contact."}
          </p>
        </div>
        <button type="button" onClick={() => { setQi(0); setScore(0); setSelected(null); setDone(false); }} style={{ padding: "13px 28px", background: color, color: "#000", borderRadius: 999, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Retake Quiz</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <Progress current={qi} total={CONF_QUIZ.length} color={color} t={t} />
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 20, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 16, color: t?.ink || "#ededed", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{q.q}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.opts.map((opt, idx) => (
          <button key={idx} type="button" onClick={() => pick(idx)}
            onTouchStart={(e) => { e.currentTarget.style.transform = "scale(0.96)"; }}
            onTouchEnd={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            style={{
            padding: "14px 16px", borderRadius: 14, textAlign: "left",
            border: `1.5px solid ${selected === idx ? color : t?.border || "rgba(255,255,255,0.1)"}`,
            background: selected === idx ? `${color}15` : t?.light || "rgba(255,255,255,0.05)",
            color: selected === idx ? color : t?.ink || "#ededed",
            fontSize: 14, cursor: "pointer", fontFamily: FONT, fontWeight: 400,
            transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)", WebkitTapHighlightColor: "transparent",
          }}>{opt}</button>
        ))}
      </div>
    </div>
  );
}

function DailyDemChallenge({ color, onClose, t, play }) {
  const challenges = [
    { emoji: "🗣️", title: "The Cold Introduction", task: "Introduce yourself to one stranger or new colleague today. Use your name, what you do, and one interesting fact about yourself. Be first.", tip: "Being first to speak shows confidence and sets the social frame." },
    { emoji: "📱", title: "No Filler Day", task: "For the next conversation you have — no 'um', 'like', 'basically', or 'you know'. Pause instead. Silence is more powerful than filler.", tip: "Strategic pauses make you appear more composed and authoritative." },
    { emoji: "👁️", title: "Eye Contact Challenge", task: "In your next 3 conversations, maintain natural eye contact 70% of the time. Don't stare — just hold it longer than you normally would.", tip: "Consistent eye contact signals confidence, engagement, and honesty." },
    { emoji: "🧍", title: "Posture Reset", task: "Set 3 phone reminders today. Each time: roll shoulders back, chin up, feet shoulder-width. Notice how your mood shifts when your body changes.", tip: "Amy Cuddy's research shows posture changes your hormone levels, not just perception." },
    { emoji: "💬", title: "Lead The Conversation", task: "Start a conversation today — ask a genuine question about something the other person cares about. Then listen more than you speak.", tip: "The best conversationalists make others feel heard, not impressed." },
    { emoji: "🎯", title: "Direct Request", task: "Ask for something directly today — no hedging, no apologising. 'Can I have X by Y time?' Say it once, clearly, then wait.", tip: "Direct requests without qualifiers are taken more seriously and respected more." },
  ];
  const today = new Date().getDay();
  const challenge = challenges[today % challenges.length];
  const [accepted, setAccepted] = useState(false);

  if (accepted) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center", fontFamily: FONT }}>
        <div
          style={{
            width: 72, height: 72, borderRadius: 22,
            background: `${color}1F`,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}
          aria-hidden="true"
        >
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>Challenge Accepted!</div>
        <div style={{ fontSize: 15, color: t?.muted || "#a1a1a1", marginBottom: 28, lineHeight: 1.55 }}>Come back tomorrow for a new one.</div>
        <button type="button" onClick={onClose} style={{ padding: "13px 32px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Done</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 20px 40px", fontFamily: FONT }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{challenge.emoji}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: t?.ink || "#ededed", letterSpacing: "-0.03em", marginBottom: 4 }}>{challenge.title}</div>
        <div style={{ fontSize: 12, color, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Challenge</div>
      </div>
      <div style={{ background: t?.light || "rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px", marginBottom: 16, border: `1px solid ${t?.border || "rgba(255,255,255,0.08)"}` }}>
        <p style={{ fontSize: 15, color: t?.ink || "#ededed", lineHeight: 1.65, margin: 0 }}>{challenge.task}</p>
      </div>
      <div style={{ background: `${color}10`, borderRadius: 16, padding: "16px 18px", border: `1px solid ${color}30` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Why This Works</p>
        <p style={{ fontSize: 13.5, color: t?.ink || "#ededed", lineHeight: 1.6, margin: 0 }}>{challenge.tip}</p>
      </div>
      <button type="button" onClick={() => { play?.("star"); setAccepted(true); }} style={{ width: "100%", marginTop: 24, padding: "14px", background: color, color: "#000", border: "none", borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>I Accept the Challenge ✓</button>
    </div>
  );
}

function WordLadderGame({ color, t, play }) {
  const [pi, setPi] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const [input, setInput] = useState("");
  const [revealed, setRevealed] = useState([0]);
  const [shake, setShake] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [score, setScore] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [done, setDone] = useState(false);

  const p = WORD_LADDER_PUZZLES[pi];
  const stepWord = p.steps[currentStep];
  const prevWord = p.steps[currentStep - 1];

  const differsBy1 = (a, b) => {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) diff++; }
    return diff === 1;
  };

  const changedLetterIdx = (a, b) => {
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) return i; }
    return -1;
  };

  const submitStep = () => {
    const guess = input.toUpperCase().trim();
    if (guess.length !== stepWord.length) return;
    if (!differsBy1(guess, prevWord)) {
      setShake(true);
      play?.("wrong");
      setTimeout(() => setShake(false), 400);
      return;
    }
    if (guess === stepWord) {
      play?.("correct");
      setCorrect(true);
      setScore(s => s + (hintUsed ? 0 : 1));
      setTotalSteps(s => s + 1);
      const newRevealed = [...revealed, currentStep];
      setRevealed(newRevealed);
      setTimeout(() => {
        setCorrect(false);
        if (currentStep + 1 >= p.steps.length) {
          if (pi + 1 >= WORD_LADDER_PUZZLES.length) { setDone(true); }
          else {
            setTimeout(() => {
              setPi(pi + 1); setCurrentStep(1); setRevealed([0]); setInput(""); setHintUsed(false);
            }, 600);
          }
        } else {
          setCurrentStep(currentStep + 1); setInput(""); setHintUsed(false);
        }
      }, 800);
    } else {
      setShake(true);
      play?.("wrong");
      setTimeout(() => setShake(false), 400);
    }
  };

  const useHint = () => {
    play?.("tap");
    setHintUsed(true);
    setInput(stepWord);
  };

  if (done) {
    const pct = totalSteps > 0 ? Math.round((score / totalSteps) * 100) : 100;
    return (
      <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🪜</div>
        <div style={{ fontSize: 26, fontWeight: 800, color: t?.ink || "#ededed", marginBottom: 8, letterSpacing: "-0.03em" }}>All Ladders Complete!</div>
        <div style={{ fontSize: 16, color, fontWeight: 700, marginBottom: 24 }}>{score}/{totalSteps} steps solved independently</div>
        <div style={{ fontSize: 13, color: t?.muted || "#a1a1a1", marginBottom: 24 }}>{pct >= 80 ? "Outstanding!" : pct >= 60 ? "Great work!" : "Keep practising!"}</div>
        <button type="button" onClick={() => { setPi(0); setCurrentStep(1); setRevealed([0]); setInput(""); setScore(0); setTotalSteps(0); setDone(false); setHintUsed(false); }} style={{ padding: "13px 28px", background: color, color: "#000", borderRadius: 999, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Play Again</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 20px 40px", fontFamily: FONT }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>Puzzle {pi + 1} of {WORD_LADDER_PUZZLES.length}</p>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: t?.muted || "#a1a1a1" }}>
            <strong style={{ color }}>{p.start}</strong> → <strong style={{ color }}>{p.end}</strong> ({p.steps.length - 1} step{p.steps.length > 2 ? "s" : ""})
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontSize: 11, color: t?.muted || "#a1a1a1" }}>Score</p>
          <p style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color, letterSpacing: "-0.02em" }}>{score}</p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginBottom: 20 }}>
        {revealed.map(idx => {
          const word = p.steps[idx];
          const prev = p.steps[idx - 1];
          const changedIdx = prev ? changedLetterIdx(prev, word) : -1;
          return (
            <div key={idx} style={{ display: "flex", gap: 5 }}>
              {word.split("").map((l, li) => (
                <div key={li} style={{
                  width: word.length > 4 ? 44 : 52, height: word.length > 4 ? 46 : 52,
                  borderRadius: 12, border: `2px solid ${li === changedIdx && idx > 0 ? color : t?.border || "rgba(255,255,255,0.15)"}`,
                  background: li === changedIdx && idx > 0 ? `${color}18` : t?.light || "rgba(255,255,255,0.05)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 800,
                  color: li === changedIdx && idx > 0 ? color : t?.ink || "#ededed",
                  fontFamily: FONT, transition: "all 0.3s ease",
                }}>{l}</div>
              ))}
            </div>
          );
        })}

        {currentStep < p.steps.length && (
          <div style={{ display: "flex", gap: 5, animation: shake ? "fillGapShake 0.35s ease" : correct ? "questionIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" : "none" }}>
            {Array.from({ length: stepWord.length }).map((_, li) => (
              <div key={li} style={{
                width: stepWord.length > 4 ? 44 : 52, height: stepWord.length > 4 ? 46 : 52,
                borderRadius: 12,
                border: `2px solid ${correct ? color : input[li] ? `${color}60` : t?.border || "rgba(255,255,255,0.2)"}`,
                background: correct ? `${color}20` : input[li] ? `${color}10` : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, fontWeight: 800,
                color: correct ? color : input[li] ? t?.ink || "#ededed" : "rgba(255,255,255,0.2)",
                fontFamily: FONT, transition: "all 0.2s ease",
              }}>{input[li] || (correct ? stepWord[li] : "")}</div>
            ))}
          </div>
        )}

        {Array.from({ length: p.steps.length - currentStep - 1 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 5, opacity: 0.2 }}>
            {p.steps[currentStep + 1 + i].split("").map((_, li) => (
              <div key={li} style={{
                width: p.steps[0].length > 4 ? 44 : 52, height: p.steps[0].length > 4 ? 46 : 52,
                borderRadius: 12, border: `2px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
                background: "transparent",
              }} />
            ))}
          </div>
        ))}
      </div>

      {currentStep < p.steps.length && (
        <>
          <p style={{ textAlign: "center", fontSize: 12.5, color: t?.muted || "#a1a1a1", marginBottom: 10, fontFamily: FONT }}>
            Change 1 letter from <strong style={{ color }}>{prevWord}</strong> — type a {stepWord.length}-letter word
          </p>
          {/* Hidden input for desktop keyboard support */}
          <input
            type="text" maxLength={stepWord.length}
            value={input}
            onChange={e => setInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))}
            onKeyDown={e => e.key === "Enter" && submitStep()}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", width: 1, height: 1 }}
          />
          {/* On-screen keyboard */}
          <div style={{ marginBottom: 12 }}>
            {[["Q","W","E","R","T","Y","U","I","O","P"],["A","S","D","F","G","H","J","K","L"],["ENTER","Z","X","C","V","B","N","M","⌫"]].map((row, kri) => (
              <div key={kri} style={{ display: "flex", justifyContent: "center", gap: 4, marginBottom: 5 }}>
                {row.map(k => {
                  const isWide = k === "ENTER" || k === "⌫";
                  return (
                    <button key={k} type="button" onClick={() => {
                      if (k === "⌫") { setInput(v => v.slice(0, -1)); play?.("tap"); }
                      else if (k === "ENTER") { submitStep(); }
                      else if (input.length < stepWord.length) { setInput(v => v + k); play?.("tap"); }
                    }} style={{
                      minWidth: isWide ? 48 : 32, height: 42, borderRadius: 8,
                      background: t?.light||"rgba(255,255,255,0.08)",
                      color: t?.ink||"#ededed",
                      border: `1px solid ${t?.border||"rgba(255,255,255,0.12)"}`,
                      fontSize: isWide ? 9 : 13, fontWeight: 700,
                      cursor: "pointer", fontFamily: FONT, WebkitTapHighlightColor: "transparent",
                      flexShrink: 0,
                    }}>{k}</button>
                  );
                })}
              </div>
            ))}
          </div>
          {!hintUsed && (
            <button type="button" onClick={useHint} style={{
              display: "block", margin: "0 auto", padding: "8px 18px",
              background: "rgba(255,255,255,0.06)", color: t?.muted || "#a1a1a1",
              border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`,
              borderRadius: 999, fontSize: 12, fontWeight: 600, cursor: "pointer",
              fontFamily: FONT, WebkitTapHighlightColor: "transparent",
            }}>💡 Reveal this step (no points)</button>
          )}
        </>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   SHARED COMPONENTS
────────────────────────────────────────────────────────────── */
function Progress({ current, total, color, t }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: t?.muted || "#a1a1a1", fontFamily: FONT }}>Question {current + 1} of {total}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600, fontFamily: FONT }}>{Math.round(((current) / total) * 100)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: t?.light || "#1a1a1a", overflow: "hidden" }}>
        <div style={{ width: `${(current / total) * 100}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.4s cubic-bezier(0.34,1.56,0.64,1)" }} />
      </div>
    </div>
  );
}

function ScoreScreen({ score, total, color, customMsg, onReplay, onClose, t, play }) {
  const pct = Math.round((score / total) * 100);
  // Centre icon varies by performance. Use SVGs for a cleaner, iOS-native feel.
  const iconPath = pct === 100
    ? <><path d="M6 9a6 6 0 0012 0V4H6v5z"/><path d="M6 4H3v3a3 3 0 003 3"/><path d="M18 4h3v3a3 3 0 01-3 3"/><path d="M9 21h6"/><path d="M12 15v6"/></>
    : pct >= 70
      ? <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
      : pct >= 50
        ? <><circle cx="12" cy="12" r="10"/><polyline points="16,10 11,15 8,12"/></>
        : <><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></>;
  // Play sound exactly once on mount. Use a ref guard so strict-mode double-invoke
  // doesn't fire it twice and so changing `play` identity doesn't re-trigger.
  const played = useRef(false);
  useEffect(() => {
    if (played.current) return;
    played.current = true;
    if (pct === 100) play?.("star");
    else if (pct >= 60) play?.("correct");
    else play?.("ok");
  }, [pct, play]);
  const confettiColors = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#FF6FF2","#FF9E4F","#A0F0A0","#B388FF","#FFB347","#4FC3F7","#FF80AB","#69F0AE"];
  return (
    <div style={{ padding: "32px 24px", textAlign: "center", fontFamily: FONT }}>
      <style>{`
        /* keyframes defined in GameModal */
      `}</style>
      {pct === 100 && (
        <div style={{ position: "relative", height: 0, overflow: "visible" }}>
          {confettiColors.map((c, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${8 + (i * 7.5)}%`,
              top: 0,
              width: 10,
              height: 10,
              borderRadius: i % 2 === 0 ? "50%" : 2,
              background: c,
              animation: `confettiFall ${1.2 + (i % 4) * 0.2}s ease-in ${(i % 5) * 0.12}s both`,
              pointerEvents: "none",
            }} />
          ))}
        </div>
      )}
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `3px solid ${color}`, animation: "scoreRing 2s ease-in-out infinite" }} />
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: t?.white || "#111111", border: `3px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{iconPath}</svg>
        </div>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: t?.ink || "#ededed", letterSpacing: "-0.04em", marginBottom: 6 }}>
        {score}/{total}
      </div>
      <div style={{ fontSize: 14, color, fontWeight: 600, marginBottom: 8 }}>{customMsg || "Score"}</div>
      <div style={{ display: "inline-flex", padding: "6px 16px", borderRadius: 999, background: pct >= 70 ? `${color}18` : t?.light || "rgba(255,255,255,0.07)", border: `1px solid ${pct >= 70 ? color + "40" : t?.border || "rgba(255,255,255,0.1)"}`, fontSize: 13, color: pct >= 70 ? color : t?.muted || "#a1a1a1", fontWeight: 600, marginBottom: 28 }}>
        {pct >= 90 ? "Outstanding!" : pct >= 70 ? "Great work!" : pct >= 50 ? "Keep going!" : "Practice makes perfect"}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button type="button" onClick={onReplay} style={{ flex: 1, padding: "13px", background: t?.light || `${color}18`, color: t?.ink || color, border: `1px solid ${t?.border || color + "40"}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>↺ Again</button>
        <button type="button" onClick={onClose} style={{ flex: 1, padding: "13px", background: t?.light || "rgba(255,255,255,0.07)", color: t?.ink || "#ededed", border: `1px solid ${t?.border || "rgba(255,255,255,0.12)"}`, borderRadius: 14, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: FONT }}>Done</button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   GAME ROUTER
────────────────────────────────────────────────────────────── */
function GameRouter({ gameId, color, onClose, t, play }) {
  const games = {
    fill_gap:     () => <FillGapGame color={color} onClose={onClose} t={t} play={play} />,
    word_guess:   () => <WordGuessGame color={color} onClose={onClose} t={t} play={play} />,
    vocab_match:  () => <VocabMatchGame color={color} onClose={onClose} t={t} play={play} />,
    sentence:     () => <SentenceBuilderGame color={color} onClose={onClose} t={t} play={play} />,
    word_trivia:  () => <MultiChoiceGame questions={WORD_TRIVIA} color={color} onClose={onClose} t={t} play={play} />,
    word_ladder:  () => <WordLadderGame color={color} onClose={onClose} t={t} play={play} />,
    fin_terms:    () => <FlashcardGame cards={FIN_TERMS} color={color} onClose={onClose} t={t} play={play} />,
    budget:       () => <BudgetGame color={color} onClose={onClose} t={t} play={play} />,
    fin_trivia:   () => <MultiChoiceGame questions={FIN_TRIVIA} color={color} onClose={onClose} t={t} play={play} />,
    invest_save:  () => <InvestSaveGame color={color} onClose={onClose} t={t} play={play} />,
    money_math:   () => <MoneyMathGame color={color} onClose={onClose} t={t} play={play} />,
    compound:     () => <CompoundGrowthGame color={color} onClose={onClose} t={t} play={play} />,
    speak_it:     () => <SpeakItGame color={color} onClose={onClose} t={t} play={play} />,
    filler_catch: () => <FillerCatcherGame color={color} onClose={onClose} t={t} play={play} />,
    tone_detect:  () => <MultiChoiceGame questions={TONE_QS.map(q => ({ q: `Tone of: "${q.message}"`, opts: q.tones, ans: q.ans, tip: q.tip }))} color={color} onClose={onClose} t={t} play={play} />,
    conf_quiz:    () => <ConfidenceQuiz color={color} onClose={onClose} t={t} play={play} />,
    daily_dem:    () => <DailyDemChallenge color={color} onClose={onClose} t={t} play={play} />,
    body_lang:    () => <MultiChoiceGame questions={BODY_QS.map(q => ({ q: q.q, opts: q.opts, ans: q.ans, tip: q.tip }))} color={color} onClose={onClose} t={t} play={play} />,
  };
  return games[gameId]?.() ?? <div style={{ padding: 24, color: t?.muted || "#a1a1a1", textAlign: "center", fontFamily: FONT }}>Coming soon…</div>;
}

/* ──────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────── */
export function LearnItSubjectPage({ t, play, subject, onBack }) {
  const [activeGame, setActiveGame] = useState(null);
  const meta = SUBJECT_META[subject] || SUBJECT_META.english;
  const games = GAMES[subject] || GAMES.english;
  const { color, lightColor, borderColor, label, emoji } = meta;

  const openGame = (id) => {
    play?.("tap");
    setActiveGame(id);
  };

  const closeGame = () => {
    play?.("back");
    setActiveGame(null);
  };

  const activeGameMeta = games.find(g => g.id === activeGame);

  return (
    <div
      data-page-tag="#learn_it_subject"
      style={{
        padding: "0 0 96px",
        fontFamily: FONT,
        minHeight: "100%",
        position: "relative",
      }}
    >
      {/* Header */}
      <div style={{
        padding: "28px 18px 22px",
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Glow bg */}
        <div aria-hidden style={{
          position: "absolute", top: -60, right: -60,
          width: 200, height: 200, borderRadius: "50%",
          background: `radial-gradient(circle, ${color}28 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Back button */}
        <button
          type="button"
          onClick={() => { play?.("back"); onBack?.(); }}
          style={{
            display: "flex", alignItems: "center", gap: 5,
            background: "none", border: "none", cursor: "pointer",
            color, fontSize: 16, fontWeight: 400, fontFamily: FONT,
            padding: 0, marginBottom: 18, WebkitTapHighlightColor: "transparent",
          }}
        >
          <svg width="10" height="18" viewBox="0 0 10 18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 1 1 9 9 17" />
          </svg>
          Learn-It
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: lightColor, border: `1.5px solid ${borderColor}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
          }}>
            {emoji}
          </div>
          <div>
            <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color, fontFamily: FONT }}>Learn-It</p>
            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, color: (t && t.ink) || "#ededed", fontFamily: FONT }}>{label}</h2>
          </div>
        </div>

        <p style={{ margin: "14px 0 0", fontSize: 13.5, color: (t && t.muted) || "#a1a1a1", lineHeight: 1.55, fontFamily: FONT, position: "relative" }}>
          {games.length} interactive activities — tap a card to flip it, then press Play.
        </p>
      </div>

      {/* Card grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 12,
        padding: "20px 16px",
      }}>
        {games.map((game, i) => (
          <FlipCard
            key={game.id}
            game={game}
            color={color}
            lightColor={lightColor}
            borderColor={borderColor}
            index={i}
            onPlay={openGame}
          />
        ))}
      </div>

      {/* Game modal */}
      {activeGame && (
        <GameModal onClose={closeGame} color={color} title={activeGameMeta?.title || "Game"} t={t} play={play}>
          <GameRouter gameId={activeGame} subject={subject} color={color} onClose={closeGame} t={t} play={play} />
        </GameModal>
      )}
    </div>
  );
}
