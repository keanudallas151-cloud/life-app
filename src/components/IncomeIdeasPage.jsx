const INCOME_SECTIONS = [
  {
    title: "Freelance Services",
    items: [
      "Copywriting for brands",
      "Email newsletter writing",
      "Short-form video editing",
      "Podcast editing",
      "Graphic design retainers",
      "Webflow site builds",
      "Shopify store setup",
      "Virtual assistant support",
      "Customer support outsourcing",
      "Lead generation outreach",
    ],
  },
  {
    title: "AI-Powered Services",
    items: [
      "AI content repurposing",
      "Prompt library creation",
      "AI chatbot setup for small business",
      "Sales script generation",
      "AI research briefs",
      "Resume rewriting with AI assistance",
      "Automated SOP creation",
      "AI image asset packs",
      "Meeting summary services",
      "AI workflow audits",
    ],
  },
  {
    title: "Digital Products",
    items: [
      "Sell templates",
      "Sell Notion dashboards",
      "Sell budgeting spreadsheets",
      "Sell pitch deck packs",
      "Sell online planners",
      "Sell swipe files",
      "Sell branding kits",
      "Sell printable study packs",
      "Sell financial trackers",
      "Sell business checklists",
    ],
  },
  {
    title: "Content & Media",
    items: [
      "Start a niche YouTube channel",
      "Monetize a newsletter",
      "Host a sponsored podcast",
      "Build a paid community",
      "Run a faceless content brand",
      "License original photos",
      "Write sponsored articles",
      "Create a paid trend report",
      "Offer ghostwriting packages",
      "Publish micro-courses",
    ],
  },
  {
    title: "Education & Coaching",
    items: [
      "1:1 coaching calls",
      "Group coaching cohorts",
      "Interview preparation sessions",
      "Language tutoring",
      "Math tutoring",
      "Public speaking coaching",
      "CV and LinkedIn optimization",
      "Financial literacy sessions",
      "Study accountability groups",
      "Portfolio review sessions",
    ],
  },
  {
    title: "Sales & Closers",
    items: [
      "Appointment setting",
      "Commission-based closing",
      "Retail arbitrage sourcing",
      "Marketplace listing optimization",
      "Cold email campaigns",
      "Affiliate landing page creation",
      "B2B prospect list building",
      "Offer packaging for founders",
      "Script writing for DMs",
      "CRM cleanup services",
    ],
  },
  {
    title: "Local Service Businesses",
    items: [
      "Window cleaning",
      "Mobile car detailing",
      "Pressure washing",
      "Lawn care routes",
      "House cleaning teams",
      "Move-out cleaning",
      "Pet sitting",
      "Dog walking",
      "Handyman callouts",
      "Furniture assembly",
    ],
  },
  {
    title: "Remote Operations",
    items: [
      "Project coordination",
      "Remote bookkeeping",
      "Inbox management",
      "Calendar management",
      "Recruiter sourcing support",
      "Community moderation",
      "Data cleanup gigs",
      "CRM migration assistance",
      "Vendor research packages",
      "Travel planning services",
    ],
  },
  {
    title: "E-commerce & Online Stores",
    items: [
      "Print-on-demand store",
      "Digital download shop",
      "Niche dropshipping brand",
      "Bundle products on Etsy",
      "Private label small products",
      "Subscription box curation",
      "Second-hand vintage flipping",
      "B2B wholesale sourcing",
      "Gift guide storefronts",
      "Niche merch brand",
    ],
  },
  {
    title: "Asset-Based Income",
    items: [
      "Rent out camera gear",
      "Rent out a spare room",
      "Rent out studio space",
      "License stock footage",
      "License music loops",
      "Rent tools locally",
      "Rent parking space",
      "Monetize a niche website",
      "Sell ad slots in a newsletter",
      "Build a micro-SaaS subscription",
    ],
  },
  {
    title: "Career Leverage",
    items: [
      "Salary negotiation consulting",
      "Corporate workshop delivery",
      "LinkedIn ghostwriting",
      "Internal documentation consulting",
      "Interview mock panels",
      "Slide deck polishing",
      "Executive assistant support",
      "Professional bio writing",
      "Industry-specific mentoring",
      "Freelance research support",
    ],
  },
];

export function IncomeIdeasPage({ t }) {
  return (
    <div
      data-page-tag="#income_ideas"
      style={{ padding: "48px 24px 72px", maxWidth: 760, margin: "0 auto" }}
    >
      <div
        style={{
          marginBottom: 28,
          padding: "22px 22px 20px",
          borderRadius: 20,
          background: `linear-gradient(135deg, ${t.white} 0%, ${t.greenLt} 100%)`,
          border: `1px solid ${t.green}30`,
          boxShadow: "0 18px 40px rgba(61,90,76,0.08)",
        }}
      >
        <h2
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(1.9rem, 5vw, 2.6rem)",
            fontWeight: 800,
            color: t.ink,
            fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
          }}
        >
          100+ Ways To Generate Income
        </h2>
        <p
          style={{
            margin: 0,
            color: t.mid,
            fontSize: 15,
            lineHeight: 1.8,
            fontStyle: "italic",
          }}
        >
          Start with what you can sell today, then move toward offers, systems,
          and assets that compound. This page is built to give you a wide map,
          not one narrow path.
        </p>
      </div>

      <div
        style={{
          marginBottom: 20,
          padding: "16px 18px",
          borderRadius: 16,
          background: t.skin,
          border: `1px solid ${t.border}`,
        }}
      >
        <p style={{ margin: 0, color: t.ink, fontSize: 14, lineHeight: 1.75 }}>
          <strong>Simple rule:</strong> start with skills, then productize what
          works, then stack recurring income on top. The fastest path is usually
          service first, system second, assets third.
        </p>
      </div>

      <div style={{ display: "grid", gap: 16 }}>
        {INCOME_SECTIONS.map((section) => (
          <section
            key={section.title}
            style={{
              background: t.white,
              border: `1px solid ${t.border}`,
              borderRadius: 18,
              padding: "22px 20px",
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: 18,
                fontWeight: 700,
                color: t.ink,
                fontFamily: "-apple-system,'SF Pro Display','SF Pro Text','Helvetica Neue',Arial,sans-serif",
              }}
            >
              {section.title}
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 10,
              }}
            >
              {section.items.map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "12px 12px",
                    borderRadius: 12,
                    background: t.skin,
                    border: `1px solid ${t.border}`,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: `${t.green}18`,
                      color: t.green,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: t.ink, fontSize: 14, lineHeight: 1.6 }}>
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
