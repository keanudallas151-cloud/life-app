// ── Demeanor: Speak It ───────────────────────────────────────
export const SPEAK_QS = [
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

// ── Demeanor: Filler Catcher ────────────────────────────────
export const FILLER_TEXTS = [
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

// ── Demeanor: Tone Detector ─────────────────────────────────
export const TONE_QS = [
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

// ── Demeanor: Confidence Quiz ───────────────────────────────
export const CONF_QUIZ = [
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

// ── Demeanor: Body Language IQ ──────────────────────────────
export const BODY_QS = [
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

// ── Demeanor: Active Listening ───────────────────────────────
// Same shape as SPEAK_QS so SpeakItGame can render it directly.
// `scenario` is what your conversation partner just said; pick the
// reply that best demonstrates active, empathetic listening.
export const LISTEN_QS = [
  { scenario: "A friend says: 'I've been so overwhelmed at work this week.'", opts: ["'You should just take a break.'","'At least you have a job.'","'That sounds exhausting — what's been the hardest part?'","'Same here, you wouldn't believe my week.'"], best: 2, why: "Reflecting feeling + open question shows you're listening to understand, not to reply." },
  { scenario: "A colleague says: 'I'm not sure if my idea is any good.'", opts: ["'Don't worry about it.'","'It's probably fine.'","'Walk me through it — I want to hear the thinking.'","'Mine was rejected too last time.'"], best: 2, why: "Inviting them to share more validates the idea and the person." },
  { scenario: "A partner says: 'I felt invisible at the dinner tonight.'", opts: ["'Nobody meant it.'","'You were quiet, that's why.'","'That sounds painful — tell me what happened from your side.'","'Next time speak up more.'"], best: 2, why: "Naming the emotion + invitation to share is the core of active listening." },
  { scenario: "A team member says: 'I think I'm in over my head on this project.'", opts: ["'You'll figure it out.'","'Just push through.'","'Thanks for telling me. What part feels heaviest right now?'","'Maybe the role isn't a fit.'"], best: 2, why: "Acknowledge first, then narrow down what specifically is heavy — opens the door without judgement." },
  { scenario: "A child says: 'Nobody at school likes me.'", opts: ["'That's not true.'","'You'll make friends, don't worry.'","'That sounds really lonely. Can you tell me about today?'","'Just be friendlier.'"], best: 2, why: "Reflect feeling, then invite specifics. Quick fixes feel dismissive." },
  { scenario: "A parent says: 'I just feel like I'm slowing down lately.'", opts: ["'You're fine, stop worrying.'","'Everyone gets older.'","'I hear you. What changes have you noticed?'","'Maybe you need more sleep.'"], best: 2, why: "Pause and ask — let them describe their experience before offering anything." },
  { scenario: "A friend says: 'I might be making a huge mistake with this move.'", opts: ["'Just commit.'","'I told you so.'","'That's a big call. What's tugging at you most?'","'Stop overthinking.'"], best: 2, why: "An open question on what's pulling at them shows respect for the complexity." },
  // Medium
  { scenario: "Someone says: 'I'm fine.' but their tone says otherwise.", opts: ["'Okay then.'","'Cool, what's for dinner?'","'You don't have to talk if you don't want to — but I'm here when you do.'","'Then act like it.'"], best: 2, why: "Acknowledge the gap, give space, signal availability — the strongest listening move when someone is shut down." },
  { scenario: "A friend interrupts themselves mid-story to say: 'Sorry, I'm rambling.'", opts: ["'A bit, yeah.'","'It's fine, finish quickly.'","'You're not — I'm following. Keep going.'","'Long story?'"], best: 2, why: "Reassure + invite continuation. Letting them finish builds trust." },
  { scenario: "A colleague says: 'I disagree with the direction we're taking.'", opts: ["'It's already decided.'","'You'll have to live with it.'","'I'd like to understand your concern — can you walk me through it?'","'Just trust the process.'"], best: 2, why: "Curious framing turns disagreement into useful information rather than conflict." },
  { scenario: "Someone says: 'I lost my dad last month.'", opts: ["'Time heals all wounds.'","'Mine passed too.'","'I'm so sorry. How are you holding up?'","'At least he's at peace.'"], best: 2, why: "Brief acknowledgement + a gentle, open question — no fixing, no comparing." },
  { scenario: "A team-mate says: 'I'm worried this presentation will go badly.'", opts: ["'It'll be fine.'","'Don't be dramatic.'","'What part has you most worried? Maybe we can work it through.'","'Just relax.'"], best: 2, why: "Specific question + collaborative tone shows you take their concern seriously." },
  // Hard
  { scenario: "A friend has just shared painful news. There's silence. You should...", opts: ["Quickly fill the silence with a story","Tell a related joke to lift the mood","Sit with them — silence is part of listening","Change the subject"], best: 2, why: "Comfortable silence after hard news is one of the most generous things you can offer someone." },
  { scenario: "Someone vents for several minutes. They pause. The most listening move is...", opts: ["Immediately offer a fix","Summarise back what you heard","Compare it to your own situation","Tell them they'll be okay"], best: 1, why: "Reflecting back ('It sounds like you're feeling X about Y') proves you actually heard them." },
  { scenario: "A partner says: 'Sometimes I don't think you really hear me.'", opts: ["'I always hear you.'","'That's unfair.'","'I want to. Can you tell me a recent moment where it felt that way?'","'Then talk louder.'"], best: 2, why: "Don't defend — get curious. Specific examples make it possible to actually change." },
];
