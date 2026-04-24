import { useState, useRef } from "react";

const SF = "-apple-system,'SF Pro Text','Helvetica Neue',Arial,sans-serif";
const SFD = "-apple-system,'SF Pro Display','Helvetica Neue',Arial,sans-serif";

/* ── Full data with rich inner content per item ─────────────────────────── */
const FOLDERS = [
  {
    id: "freelance",
    emoji: "✍️",
    title: "Freelance Services",
    subtitle: "Sell your skills directly",
    color: "#3B82F6",
    items: [
      { name: "Copywriting", desc: "Write persuasive content for brands — landing pages, emails, ads. Charge $0.10–$0.50/word or $500–$3k/project.", how: "Start on Upwork or cold DM brands on Instagram. Build a 3-sample portfolio first." },
      { name: "Video Editing", desc: "Short-form editing for YouTube Shorts, TikTok and Reels is the highest demand skill right now.", how: "Offer your first 3 clients a free edit. Learn CapCut or Premiere. Charge $50–$300/video." },
      { name: "Podcast Editing", desc: "Remove ums, level audio, add intros/outros. Most podcasters hate editing.", how: "Use Descript. Reach out to new podcasters on Spotify. Charge $75–$200/episode." },
      { name: "Graphic Design", desc: "Brand assets, social templates, thumbnails. Canva + Figma are your tools.", how: "Build 5 mock brand kits. Post on Dribbble. Price at $300–$2k/month retainer." },
      { name: "Webflow Builds", desc: "Build no-code websites fast. Clients pay $2k–$15k for a clean site.", how: "Complete Webflow University free. Then clone and rebuild 3 real sites in your portfolio." },
      { name: "Virtual Assistant", desc: "Inbox, scheduling, research, admin. Remote, flexible and in huge demand.", how: "List on Belay, Time Etc or Upwork. Start at $15–$25/hr and scale up." },
      { name: "Shopify Setup", desc: "Build and configure stores for e-commerce brands. Add apps, design pages, write copy.", how: "Shopify's Partner program gets you free dev stores to practice on." },
      { name: "Lead Generation", desc: "Find and qualify prospects for businesses. Pure outreach and research work.", how: "Learn Sales Navigator + Apollo.io. Charge $500–$2k/month per client." },
      { name: "Email Newsletters", desc: "Write and send weekly newsletters for brands who don't have time.", how: "Use Beehiiv or Kit. Charge $500–$2,500/month. Pitch one local business today." },
      { name: "SOP Creation", desc: "Document processes for scaling businesses. Founders pay well for this.", how: "Interview the owner, film their screen, write it up in Notion. $500–$3k/doc set." },
    ],
  },
  {
    id: "digital",
    emoji: "📦",
    title: "Digital Products",
    subtitle: "Build once, sell forever",
    color: "#8B5CF6",
    items: [
      { name: "Notion Templates", desc: "Build dashboards for students, founders, freelancers. Sell on Gumroad.", how: "Find a gap (e.g. 'freelance invoice tracker'). Build it. Price at $9–$49." },
      { name: "Canva Templates", desc: "Social media packs, pitch decks, brand kits. Huge demand from content creators.", how: "List on Creative Market or Etsy. Price bundles at $15–$49." },
      { name: "Budget Spreadsheets", desc: "Money trackers, expense logs, savings goals. People love paying for clarity.", how: "Build in Google Sheets. Sell on Gumroad for $7–$27." },
      { name: "Online Courses", desc: "Teach what you know in a video format. Even a short course earns passive income.", how: "Record on Loom. Host on Gumroad or Teachable. Price at $47–$297." },
      { name: "E-books / Guides", desc: "PDF playbooks on a specific topic. Easy to produce, easy to sell.", how: "Write 3,000–8,000 words in Notion. Export as PDF. Sell for $7–$49." },
      { name: "Swipe Files", desc: "Collections of great ads, emails, hooks, headlines. Marketers pay for these.", how: "Curate 50–100 examples. Sell on Gumroad or Twitter/X for $9–$29." },
      { name: "Prompt Libraries", desc: "Organised, tested AI prompts for specific niches or workflows.", how: "Build in Notion. Niche down (e.g. 'ChatGPT prompts for real estate agents'). $15–$49." },
      { name: "Pitch Deck Packs", desc: "Slide templates for startup pitches, investor decks, proposals.", how: "Build in Canva or PowerPoint. Sell 5–10 designs as a bundle at $29–$79." },
      { name: "Study Packs", desc: "Flashcard sets, notes, cheat sheets for popular exams or certifications.", how: "Post on Anki, Etsy or Payhip. Price at $5–$25. Volume is key." },
      { name: "Printable Planners", desc: "Daily/weekly/monthly planners. Massive market on Etsy.", how: "Design in Canva. List on Etsy with SEO-optimised titles. Scale with ads." },
    ],
  },
  {
    id: "content",
    emoji: "🎙️",
    title: "Content & Media",
    subtitle: "Build an audience that pays",
    color: "#EC4899",
    items: [
      { name: "YouTube Channel", desc: "Pick a niche, post consistently, monetise with ads, sponsorships, products.", how: "Start faceless if camera-shy. Use stock footage + voiceover. 1,000 subs unlocks AdSense." },
      { name: "Newsletter", desc: "Email is the most direct line to an audience. Monetise with ads or paid tiers.", how: "Start free on Beehiiv. Write once a week. Hit 1,000 subs, then sell a $9/month tier." },
      { name: "Podcast", desc: "Long-form audio builds deep loyalty. Sponsorships start at 1,000 listeners.", how: "Record on Riverside.fm. Submit to Spotify and Apple. Pitch sponsors at 500+ listeners." },
      { name: "Paid Community", desc: "Charge for access to a curated group of like-minded people.", how: "Use Circle or Discord. Charge $7–$47/month. Start with 10 founding members." },
      { name: "Ghostwriting", desc: "Write LinkedIn posts, Twitter/X threads or books for founders and execs.", how: "Ghostwrite 3 posts for free to build case studies. Charge $500–$5k/month." },
      { name: "Sponsored Articles", desc: "Write niche content that brands pay to be featured in.", how: "Build a niche blog or newsletter. Charge $200–$2k per sponsored post." },
      { name: "Faceless Brand", desc: "Run a content brand without showing your face. Hugely scalable.", how: "Pick a niche (finance, tech, fitness). Use AI voiceovers + stock footage." },
      { name: "Micro-courses", desc: "Short 60–90 min courses on very specific problems. Easier to sell than big courses.", how: "Sell for $47–$197. Host on Gumroad or Lemon Squeezy." },
      { name: "Trend Reports", desc: "Compile and sell weekly or monthly trend reports in your niche.", how: "Charge $29–$99/report or $49/month subscription. Build on Substack." },
      { name: "Stock Photos/Video", desc: "Sell original visual content to Shutterstock, Getty, Adobe Stock.", how: "Focus on niche subjects with low supply. Upload 500+ assets for meaningful income." },
    ],
  },
  {
    id: "trading",
    emoji: "📈",
    title: "Trading & Investing",
    subtitle: "Make money work for you",
    color: "#10B981",
    items: [
      { name: "Stock Trading", desc: "Buy and sell shares of companies. Short-term or long-term positions.", how: "Start with paper trading (practice money) on TD Ameritrade. Learn candlestick charts, RSI and MACD before risking real money." },
      { name: "Options Trading", desc: "Buy the right (not obligation) to buy/sell a stock at a set price. Higher risk, higher reward.", how: "Learn calls vs puts, strike price, and expiration first. Use Tastytrade for beginner-friendly options. Never risk more than 1–2% of capital per trade." },
      { name: "Crypto Spot Trading", desc: "Buy cryptocurrencies at current prices and hold or sell for profit.", how: "Start with BTC and ETH on Coinbase or Kraken. Dollar-cost average in. Store long-term holds in a hardware wallet." },
      { name: "Index Investing", desc: "Buy low-cost ETFs (like S&P 500) and hold for the long term. The simplest wealth builder.", how: "Open a brokerage or ISA. Buy VOO, VTI or similar monthly. Compound over 10–30 years. No active management needed." },
      { name: "Forex Trading", desc: "Trade currency pairs (EUR/USD, GBP/JPY). 24/5 market with massive liquidity.", how: "Learn support/resistance, moving averages and risk management. Use a demo account on MetaTrader for 3 months before going live." },
      { name: "Dividend Stocks", desc: "Buy stocks that pay regular cash dividends — income without selling.", how: "Look for companies with 3%+ dividend yield and 10+ years of consistent payment. Reinvest dividends (DRIP) to compound." },
      { name: "Copy Trading", desc: "Automatically copy the trades of successful investors on platforms like eToro.", how: "On eToro, filter by 2+ years of consistent returns and low drawdown. Start small and diversify across 3–5 traders." },
      { name: "Crypto Staking", desc: "Lock up crypto to earn yield — like interest on a savings account.", how: "Stake ETH on Lido, ATOM on Keplr or SOL on Phantom. Yields range from 4–15% APY depending on the asset." },
      { name: "REITs", desc: "Real Estate Investment Trusts — invest in property without buying it. Pays dividends.", how: "Buy REIT ETFs (VNQ) or individual REITs on any brokerage. Look for 4%+ dividend yield." },
      { name: "DCA Strategy", desc: "Dollar-cost averaging — invest a fixed amount weekly/monthly regardless of price.", how: "Set up auto-invest on Coinbase, Vanguard or Trading 212. Remove emotion, beat the market over time." },
    ],
  },
  {
    id: "ai",
    emoji: "🤖",
    title: "AI-Powered Income",
    subtitle: "Leverage AI before everyone else does",
    color: "#F59E0B",
    items: [
      { name: "AI Content Agency", desc: "Help businesses produce 10x more content using AI tools. Huge opportunity right now.", how: "Use ChatGPT + Claude + Jasper. Charge $1,500–$5k/month per client for done-for-you AI content." },
      { name: "AI Chatbot Setup", desc: "Build custom GPT chatbots for small businesses — for customer support, sales, or FAQs.", how: "Use Chatbase or Voiceflow. Charge $500–$3k setup + $200/month maintenance." },
      { name: "AI Video Generation", desc: "Create faceless videos using Runway, Pika, or HeyGen. Sell to businesses and creators.", how: "Offer video creation packages. Charge $200–$1k per video or $2k/month retainer." },
      { name: "Automated Lead Gen", desc: "Use AI to find, qualify and reach out to leads for businesses at scale.", how: "Use Apollo + Clay + GPT for personalised outreach at scale. Charge per lead or flat retainer." },
      { name: "AI Resume Writer", desc: "Use AI to rewrite resumes, LinkedIn profiles and cover letters for job seekers.", how: "Charge $99–$399 per resume package. Offer on Fiverr or direct via social media." },
      { name: "Voice Cloning Service", desc: "Clone client voices for podcasts, videos and ads using ElevenLabs or similar tools.", how: "Sell packages for creators who want to produce at scale without recording themselves." },
      { name: "AI Research Reports", desc: "Use AI to generate detailed industry reports, competitor analyses or market briefs.", how: "Sell to consultants, founders, investors. Charge $200–$2k per report." },
      { name: "Prompt Engineering", desc: "Design and sell high-performance prompt libraries for specific business use cases.", how: "Niche down (legal, medical, marketing). Sell on Gumroad or by direct outreach." },
      { name: "AI Automation Builds", desc: "Build Make.com or Zapier automations powered by AI for SMBs.", how: "Learn Make.com free tier. Charge $500–$5k per automation build + $200/month support." },
      { name: "AI SaaS Products", desc: "Build micro-SaaS tools powered by AI APIs. Charge monthly subscriptions.", how: "Use Bubble or Glide for no-code. Wrap OpenAI or Anthropic API. Charge $9–$99/month." },
    ],
  },
  {
    id: "ecommerce",
    emoji: "🛒",
    title: "E-commerce & Reselling",
    subtitle: "Buy low, sell high — at any scale",
    color: "#EF4444",
    items: [
      { name: "Print-on-Demand", desc: "Design products (T-shirts, mugs, hoodies) that get printed when ordered. Zero stock.", how: "Use Printful + Etsy or Shopify. Design in Canva. Market on Pinterest or TikTok." },
      { name: "Retail Arbitrage", desc: "Buy discounted products in stores and resell online for profit.", how: "Use the Amazon Seller app to scan barcodes in TK Maxx, ASDA, clearance stores. Ship to Amazon FBA." },
      { name: "Dropshipping", desc: "Sell products online without holding stock — supplier ships directly to customer.", how: "Use DSers + AliExpress or AutoDS. Research winning products on Minea or AdSpy." },
      { name: "Vintage Flipping", desc: "Buy second-hand items cheap, resell at higher prices on Vinted, eBay or Depop.", how: "Focus on branded clothing, electronics or collectibles. Buy at charity shops or car boots." },
      { name: "Niche Etsy Store", desc: "Sell handmade, vintage or digital products on Etsy's built-in marketplace.", how: "Use eRank for SEO research. Upload 20+ listings in a tight niche. Run Etsy ads at $1–$5/day." },
      { name: "Wholesale Sourcing", desc: "Buy in bulk from manufacturers, sell individually for higher margins.", how: "Source from Alibaba or local wholesalers. Start with 1 product, test margins before scaling." },
      { name: "Subscription Boxes", desc: "Curate themed boxes of products and charge monthly for a recurring experience.", how: "Use Cratejoy or Shopify with ReCharge. Partner with brands for product donations initially." },
      { name: "Private Label", desc: "Put your own brand on existing products and sell at higher margins.", how: "Source from Alibaba, design custom packaging, sell on Amazon FBA or your own Shopify store." },
      { name: "Digital Downloads on Etsy", desc: "Sell PDFs, SVGs, templates, fonts or art prints — instant delivery, no stock.", how: "One listing can earn for years. Focus on commercial-use clipart, fonts or planner printables." },
      { name: "Niche Merch Brand", desc: "Build a brand around a community or interest and sell branded merchandise.", how: "Find a passionate niche (e.g. beekeepers, sourdough fans). Launch on Printful. Market in that community." },
    ],
  },
  {
    id: "local",
    emoji: "🏘️",
    title: "Local & Service Business",
    subtitle: "Offline money, real results",
    color: "#6366F1",
    items: [
      { name: "Mobile Car Detailing", desc: "Clean and detail cars at the client's home or office. Premium service, high margins.", how: "Start with $300 in equipment (pressure washer, polish, vac). Charge $100–$300 per detail." },
      { name: "Pressure Washing", desc: "Clean driveways, patios, fences. High demand in spring/summer.", how: "Rent a machine to start, then buy once profitable. Charge $100–$500 per job. Flyer your street." },
      { name: "Lawn Care Routes", desc: "Mow lawns weekly for a recurring customer base. Scales into a team.", how: "Start with a $300 mower. Door-knock your street. Charge $30–$80/cut. Build a route of 20 clients." },
      { name: "House Cleaning", desc: "Residential cleaning is stable, recurring revenue with low startup cost.", how: "Charge $100–$250/clean. List on Bark, TaskRabbit or Facebook Marketplace. Upsell deep cleans." },
      { name: "Window Cleaning", desc: "Exterior window cleaning for homes and businesses. Great margins.", how: "Equipment costs ~$200. Charge $50–$300 per job. Knock on doors in high-value neighbourhoods." },
      { name: "Pet Sitting / Dog Walking", desc: "Care for pets while owners travel or work. Growing market.", how: "List on Rover or Wag. Charge $15–$30/walk, $50–$100/night pet sitting." },
      { name: "Handyman Services", desc: "Small repairs, flat-pack assembly, TV mounting. Everyone needs this.", how: "List on TaskRabbit. Charge $50–$100/hr. Let your first 10 jobs build your 5-star reviews." },
      { name: "Furniture Assembly", desc: "Assemble IKEA and flat-pack furniture. Simple, in demand, pays well.", how: "List on TaskRabbit or Airtasker. Charge $60–$120/hr. Average job takes 1–3 hours." },
      { name: "Move-Out Cleaning", desc: "Deep-clean properties at end of tenancy. High value, one-off jobs.", how: "Charge $200–$500 per property. Partner with local estate agents for referrals." },
      { name: "Errand Running", desc: "Shop, collect, deliver — for busy professionals and elderly clients.", how: "List on TaskRabbit. Charge $20–$40/hr plus reimbursement. Build regulars for monthly retainers." },
    ],
  },
  {
    id: "assets",
    emoji: "🏦",
    title: "Asset-Based Income",
    subtitle: "Let what you own earn for you",
    color: "#14B8A6",
    items: [
      { name: "Rent Your Space", desc: "Rent out a spare room, driveway, garage or studio space for recurring cash.", how: "List on Airbnb, SpareRoom or JustPark. Photograph well and price competitively." },
      { name: "Niche Website", desc: "Build a content site around a topic and monetise with ads, affiliates or products.", how: "Use SiteFinder or Niche Pursuits for research. Build with WordPress. Monetise on Mediavine at 50k+ monthly views." },
      { name: "Newsletter Ads", desc: "Sell ad slots in your email newsletter to brands targeting your audience.", how: "At 2,000–5,000 subscribers you can charge $100–$500/issue. Use SparkLoop to connect with sponsors." },
      { name: "Stock Music/Loops", desc: "Produce short music loops and license them on Epidemic Sound, Artlist or Pond5.", how: "You get paid every time a creator uses your track. Focus on genre-specific content." },
      { name: "Stock Footage", desc: "Sell video clips to Shutterstock, Getty or Adobe Stock for passive royalties.", how: "Film 4K footage of cityscapes, nature, people, objects. Upload 200+ clips for meaningful monthly income." },
      { name: "Rent Your Camera Gear", desc: "Rent out cameras, lenses, lighting to local filmmakers and content creators.", how: "List on ShareGrid or KitSplit. Insure your gear first. Earn 20–40% of gear value per month." },
      { name: "Micro-SaaS", desc: "Build a simple software tool with a recurring subscription model.", how: "Find a painful workflow. Build an MVP in Bubble or using GPT API. Charge $9–$99/month." },
      { name: "Domain Flipping", desc: "Buy short, memorable domain names cheap and sell them for profit.", how: "Use GoDaddy Auctions or Namecheap. Research brandable names in emerging niches." },
      { name: "YouTube Licensing", desc: "Sell the rights to your viral video clips to news outlets and brands.", how: "Submit to Jukin Media or Storyful. A single clip can earn $500–$50,000." },
      { name: "Royalty Investments", desc: "Invest in music or IP royalties and earn a percentage of future earnings.", how: "Use Royal.io or Royalty Exchange. Start with $100–$1k. Diversify across multiple artists." },
    ],
  },
  {
    id: "career",
    emoji: "💼",
    title: "Career & Consulting",
    subtitle: "Get paid for what you already know",
    color: "#F97316",
    items: [
      { name: "1:1 Coaching", desc: "Coach people on skills you've mastered — fitness, finance, mindset, career.", how: "Charge $100–$500/session. Book via Calendly + Stripe. Sell on social media or through your network." },
      { name: "Salary Negotiation", desc: "Help professionals negotiate higher offers. The results speak for themselves.", how: "Charge a % of the raise secured (10–20%) or a flat $300–$1k fee. Market to job-switchers." },
      { name: "LinkedIn Ghostwriting", desc: "Write weekly LinkedIn content for founders, executives and professionals.", how: "Charge $1,000–$4,000/month. Cold DM 10 founders per day with a free sample post." },
      { name: "Corporate Workshops", desc: "Deliver live training sessions on topics like productivity, AI tools or communication.", how: "Charge $500–$5k per workshop. Pitch HR teams at local businesses. Build a 1-page pitch deck." },
      { name: "Mock Interviews", desc: "Prepare candidates for job interviews in your industry with realistic practice.", how: "Charge $100–$300/session. List on Pramp, Exponent or your own site." },
      { name: "CV Optimisation", desc: "Rewrite resumes and LinkedIn profiles for job seekers.", how: "Charge $99–$399 per package. Market to graduates, career-changers, redundancy seekers." },
      { name: "Industry Mentoring", desc: "Guide juniors in your field through structured mentorship programmes.", how: "List on MentorCruise or ADPList. Charge $100–$500/month. 4 clients = $2k/month." },
      { name: "Slide Deck Consultant", desc: "Polish and redesign pitch decks for startups and sales teams.", how: "Charge $500–$3k per deck. Get referrals through startup communities and co-working spaces." },
      { name: "Fractional Executive", desc: "Act as a part-time CMO, CFO or COO for growing businesses.", how: "Charge $2k–$10k/month. Pitch seed and Series A startups who need experience but can't afford full-time hires." },
      { name: "Research Support", desc: "Provide deep research and analysis for academics, journalists, or investors.", how: "Charge $50–$150/hr. Build a profile on Expert360 or list on Catalant." },
    ],
  },
  {
    id: "remote",
    emoji: "🌐",
    title: "Remote Operations",
    subtitle: "Work for anyone, from anywhere",
    color: "#06B6D4",
    items: [
      { name: "Remote Bookkeeping", desc: "Manage accounts, reconcile transactions, produce reports for small businesses.", how: "Get a Xero or QuickBooks certification (free or cheap). Charge $300–$1,500/month per client." },
      { name: "Project Coordination", desc: "Keep projects on track, manage timelines, run standups — all remotely.", how: "Learn Asana, Monday or Notion. Charge $25–$60/hr. Find work on Upwork or We Work Remotely." },
      { name: "Community Management", desc: "Moderate and grow online communities for brands and creators.", how: "Charge $500–$2,000/month per community. Manage Discord, Slack or Circle spaces." },
      { name: "CRM Management", desc: "Set up, clean and maintain CRM systems for sales teams.", how: "Learn HubSpot (free certification). Charge $500–$2k per setup + $500/month ongoing." },
      { name: "Inbox Management", desc: "Sort, reply and organise email accounts for busy founders and execs.", how: "Charge $15–$40/hr or $500–$1,500/month. Find clients on Upwork or LinkedIn." },
      { name: "Data Entry & Cleanup", desc: "Organise, verify and clean datasets for businesses. Repetitive but reliable income.", how: "List on Upwork. Start at $10–$20/hr. Specialise in a tool (Airtable, Notion) to charge more." },
      { name: "Recruiting Support", desc: "Source candidates, screen applicants, schedule interviews for growing companies.", how: "Charge $500–$2k/month retainer or $1k–$5k per successful placement." },
      { name: "Calendar Management", desc: "Manage complex calendars and scheduling for execs who are always in meetings.", how: "Charge $15–$35/hr. Look for clients at executive assistant agencies or on Belay." },
      { name: "Travel Planning", desc: "Research and book flights, hotels, itineraries for busy professionals.", how: "Charge $50–$500/trip plan or a monthly retainer. Market to frequent travellers." },
      { name: "Vendor Research", desc: "Find, compare and shortlist suppliers and service providers for businesses.", how: "Charge $300–$1,500/project. Market to procurement teams and operations managers." },
    ],
  },
];

/* ── Inner item row (inside expanded folder) ────────────────────────────── */
function IncomeItem({ item, color, idx }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 1,
        transition: "background 0.15s ease",
      }}
    >
      {/* Row header */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "13px 16px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          textAlign: "left",
          transition: "background 0.1s ease",
          position: "relative",
        }}
      >
        {/* Number badge */}
        <span style={{
          width: 26, height: 26, borderRadius: 8,
          background: `${color}20`,
          color, fontSize: 11, fontWeight: 700, fontFamily: SF,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, letterSpacing: "-0.01em",
        }}>
          {idx + 1}
        </span>

        {/* Title */}
        <span style={{ flex: 1, fontSize: 15, fontWeight: 500, color: "#ededed", fontFamily: SF, letterSpacing: "-0.01em" }}>
          {item.name}
        </span>

        {/* Chevron */}
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={open ? color : "rgba(161,161,161,0.5)"}
          strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
          style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1), stroke 0.18s ease", flexShrink: 0 }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Expanded content */}
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "0 16px 16px 54px" }}>
            <p style={{ margin: "0 0 10px", fontSize: 14, color: "rgba(161,161,161,0.9)", lineHeight: 1.6, fontFamily: SF }}>
              {item.desc}
            </p>
            <div style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: `${color}12`,
              border: `1px solid ${color}25`,
            }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: SF }}>
                How to start
              </p>
              <p style={{ margin: 0, fontSize: 13.5, color: "#ededed", lineHeight: 1.6, fontFamily: SF }}>
                {item.how}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hairline separator */}
      <div style={{ height: 0.5, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />
    </div>
  );
}

/* ── Folder card (collapsed / expanded) ─────────────────────────────────── */
function FolderCard({ folder, t, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [pressed, setPressed] = useState(false);

  return (
    <div style={{
      borderRadius: 20,
      overflow: "hidden",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.08)`,
      transition: "box-shadow 0.2s ease",
      boxShadow: open
        ? `0 8px 32px rgba(0,0,0,0.2), 0 0 0 1px ${folder.color}20`
        : "0 2px 8px rgba(0,0,0,0.12)",
    }}>
      {/* Folder header — this is the tap target */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 18px",
          background: open
            ? `linear-gradient(135deg, ${folder.color}18 0%, rgba(255,255,255,0.03) 100%)`
            : "transparent",
          border: "none",
          cursor: "pointer",
          WebkitTapHighlightColor: "transparent",
          textAlign: "left",
          transform: pressed ? "scale(0.985)" : "scale(1)",
          transition: "background 0.2s ease, transform 0.12s ease",
          borderBottom: open ? "0.5px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        {/* Emoji icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${folder.color}1a`,
          border: `1.5px solid ${folder.color}35`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
          transition: "transform 0.22s cubic-bezier(0.34,1.56,0.64,1)",
          transform: open ? "scale(1.05)" : "scale(1)",
        }}>
          {folder.emoji}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#ededed", fontFamily: SFD, letterSpacing: "-0.02em", lineHeight: 1.25 }}>
            {folder.title}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "rgba(161,161,161,0.7)", fontFamily: SF, letterSpacing: "-0.01em" }}>
            {folder.subtitle} · {folder.items.length} ways
          </p>
        </div>

        {/* Count pill + chevron */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{
            padding: "3px 9px", borderRadius: 999,
            background: open ? `${folder.color}25` : "rgba(255,255,255,0.07)",
            border: `1px solid ${open ? folder.color + "40" : "rgba(255,255,255,0.1)"}`,
            color: open ? folder.color : "rgba(161,161,161,0.7)",
            fontSize: 12, fontWeight: 600, fontFamily: SF,
            transition: "all 0.18s ease",
          }}>
            {folder.items.length}
          </span>
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke={open ? folder.color : "rgba(161,161,161,0.5)"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </button>

      {/* Item list — grid expand trick for smooth animation */}
      <div style={{
        display: "grid",
        gridTemplateRows: open ? "1fr" : "0fr",
        transition: "grid-template-rows 0.32s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ overflow: "hidden" }}>
          <div>
            {folder.items.map((item, idx) => (
              <IncomeItem key={item.name} item={item} color={folder.color} idx={idx} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export function IncomeIdeasPage({ t, play }) {
  const [search, setSearch] = useState("");
  const totalItems = FOLDERS.reduce((a, f) => a + f.items.length, 0);

  // Filter by search
  const visible = search
    ? FOLDERS.map(f => ({
        ...f,
        items: f.items.filter(i =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.desc.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(f => f.items.length > 0)
    : FOLDERS;

  return (
    <div
      data-page-tag="#income_ideas"
      style={{ padding: "28px 16px 96px", maxWidth: 640, margin: "0 auto", fontFamily: SF }}
    >
      {/* Header */}
      <p style={{ margin: "0 0 6px", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: "#50c878", fontFamily: SF }}>
        Tools
      </p>
      <h1 style={{
        margin: "0 0 6px", fontSize: 34, fontWeight: 700, color: "#ededed",
        letterSpacing: "-0.035em", lineHeight: 1.05, fontFamily: SFD,
      }}>
        100+ Income Ideas
      </h1>
      <p style={{ margin: "0 0 22px", fontSize: 14.5, color: "rgba(161,161,161,0.8)", lineHeight: 1.55, fontFamily: SF }}>
        {totalItems} ways to generate income across {FOLDERS.length} categories. Tap any folder to explore.
      </p>

      {/* Search bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        background: "rgba(118,118,128,0.16)", borderRadius: 12,
        padding: "0 12px", marginBottom: 20, height: 40,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginRight: 8, color: "rgba(161,161,161,0.7)" }}>
          <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="10" y1="10" x2="14" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search ideas…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            fontSize: 15, color: "#ededed", fontFamily: SF, height: 40, padding: 0,
          }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(161,161,161,0.6)", padding: "0 0 0 8px", fontSize: 18, lineHeight: 1 }}>×</button>
        )}
      </div>

      {/* Simple rule callout */}
      {!search && (
        <div style={{
          padding: "14px 16px", borderRadius: 14, marginBottom: 20,
          background: "rgba(80,200,120,0.08)", border: "1px solid rgba(80,200,120,0.18)",
        }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "#ededed", lineHeight: 1.6, fontFamily: SF }}>
            <strong style={{ color: "#50c878" }}>Simple rule:</strong> skills first → productise what works → stack recurring assets on top.
          </p>
        </div>
      )}

      {/* Search empty state */}
      {search && visible.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <p style={{ color: "#ededed", fontSize: 16, fontWeight: 600, fontFamily: SFD, margin: "0 0 6px" }}>No matches</p>
          <p style={{ color: "rgba(161,161,161,0.7)", fontSize: 14, fontFamily: SF, margin: 0 }}>Try a different keyword</p>
        </div>
      )}

      {/* Folder list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {visible.map((folder, i) => (
          <FolderCard key={folder.id} folder={folder} t={t} defaultOpen={search ? true : false} />
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: 11.5, color: "rgba(161,161,161,0.3)", marginTop: 32, fontFamily: SF }}>
        {totalItems} ideas · updated 2025
      </p>
    </div>
  );
}
