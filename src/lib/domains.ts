import { careers, domains, type Career } from "./careers";

export const slugifyDomain = (d: string) =>
  d.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export type DomainData = {
  name: string;
  slug: string;
  tagline: string;
  overview: string;
  whyNow: string;
  avgSalary: string;
  growth: string;
  demand: "Extreme" | "High" | "Moderate";
  topSkills: string[];
  topCompanies: string[];
  relatedCareers: Career[];
  roadmap: { phase: string; title: string; duration: string; items: string[] }[];
  dailyTasks: { title: string; duration: string; type: "Learn" | "Build" | "Network" | "Reflect" }[];
  weeklyGoals: string[];
  longTermMilestones: { year: string; goal: string }[];
  resources: { title: string; type: string; url?: string }[];
};

const SEED: Record<string, Partial<DomainData>> = {
  technology: {
    tagline: "Engineer the systems that run the world.",
    overview: "Technology is the largest, fastest-growing career domain. From backend engineering to AI, every industry is now a tech industry.",
    whyNow: "AI, cloud, and automation are creating 4M+ new tech roles by 2030.",
    avgSalary: "$110k – $250k",
    growth: "+28% YoY",
    demand: "Extreme",
    topSkills: ["Programming", "System Design", "Cloud", "AI/ML", "Problem Solving"],
    topCompanies: ["Google", "Microsoft", "Amazon", "Meta", "OpenAI", "Stripe"],
  },
  medical: {
    tagline: "Heal humans. Push the boundary of biology.",
    overview: "Medicine spans clinical practice, surgery, public health, research, and med-tech. High impact, long training, lifetime stability.",
    whyNow: "Aging populations + AI diagnostics + biotech = massive demand for the next decade.",
    avgSalary: "$90k – $400k",
    growth: "+9% YoY",
    demand: "High",
    topSkills: ["Biology", "Diagnostics", "Empathy", "Pharmacology", "Research"],
    topCompanies: ["Mayo Clinic", "Apollo", "AIIMS", "Pfizer", "Moderna", "Cleveland Clinic"],
  },
  business: {
    tagline: "Build, scale, and run companies.",
    overview: "Business spans operations, strategy, consulting, and leadership across every industry.",
    whyNow: "Modern operators who blend data, AI, and strategy are 3x more valuable than pure MBAs.",
    avgSalary: "$80k – $300k",
    growth: "+12% YoY",
    demand: "High",
    topSkills: ["Strategy", "Analytics", "Leadership", "Communication", "Finance"],
    topCompanies: ["McKinsey", "BCG", "Bain", "Deloitte", "Goldman Sachs"],
  },
  finance: {
    tagline: "Move global capital with precision.",
    overview: "Investment banking, asset management, quant trading, fintech, and CFO tracks.",
    whyNow: "Fintech + AI is reshaping who gets hired — modeling and code skills now dominate.",
    avgSalary: "$90k – $500k+",
    growth: "+10% YoY",
    demand: "High",
    topSkills: ["Modeling", "Excel", "Python", "Accounting", "Valuation"],
    topCompanies: ["Goldman Sachs", "JPMorgan", "Citadel", "BlackRock", "Stripe"],
  },
  government: {
    tagline: "Serve the public. Shape policy.",
    overview: "Civil services, defense, policy think tanks, and public administration.",
    whyNow: "Governments are hiring AI/data talent into traditional bureaucracies at record pace.",
    avgSalary: "Govt scale + benefits",
    growth: "Stable",
    demand: "High",
    topSkills: ["Policy", "Leadership", "Ethics", "General Studies", "Writing"],
    topCompanies: ["UPSC", "IAS", "IPS", "Foreign Service", "Defense Services"],
  },
  design: {
    tagline: "Make the world feel intuitive and beautiful.",
    overview: "UX, product, graphic, industrial, motion, and brand design.",
    whyNow: "Every AI product is a design problem — top designers are scarcer than engineers.",
    avgSalary: "$70k – $200k",
    growth: "+18% YoY",
    demand: "High",
    topSkills: ["Figma", "Prototyping", "Typography", "Research", "Systems Thinking"],
    topCompanies: ["Apple", "Airbnb", "Linear", "Figma", "Stripe"],
  },
  law: {
    tagline: "Argue, advise, and architect justice.",
    overview: "Litigation, corporate law, tech/IP law, judiciary, and policy.",
    whyNow: "AI regulation, data privacy, and crypto have opened entirely new legal specializations.",
    avgSalary: "$80k – $400k",
    growth: "+6% YoY",
    demand: "Moderate",
    topSkills: ["Research", "Writing", "Negotiation", "Argumentation", "Ethics"],
    topCompanies: ["Cyril Amarchand", "AZB", "Latham & Watkins", "Khaitan & Co"],
  },
  marketing: {
    tagline: "Turn attention into growth.",
    overview: "Brand, performance, content, growth, and product marketing.",
    whyNow: "AI tools have made creative leverage 10x — top marketers move markets.",
    avgSalary: "$55k – $180k",
    growth: "+15% YoY",
    demand: "High",
    topSkills: ["Copywriting", "SEO", "Paid Ads", "Analytics", "Brand"],
    topCompanies: ["Nike", "Coca-Cola", "Unilever", "HubSpot", "Notion"],
  },
};

function buildRoadmap(domain: string): DomainData["roadmap"] {
  return [
    { phase: "Phase 01", title: "Discover & decide", duration: "Month 1–2", items: [`Read 5 books and 20 articles on ${domain}`, "Interview 5 working professionals", "Pick a sub-specialty"] },
    { phase: "Phase 02", title: "Foundations", duration: "Month 3–5", items: ["Complete 2 foundational courses", "Master the core tools of the trade", "Build a public learning log"] },
    { phase: "Phase 03", title: "Build & ship", duration: "Month 6–9", items: ["Ship 3 portfolio projects", "Get your first paid gig or internship", "Find a mentor in the field"] },
    { phase: "Phase 04", title: "Land the role", duration: "Month 10–12", items: ["Tailored resume + portfolio", "Mock interviews × 10", "Apply to 30 targeted roles"] },
    { phase: "Phase 05", title: "Compound", duration: "Year 2–3", items: ["Deep specialization", "Public reputation (talks, posts, papers)", "Promotion or pivot to senior role"] },
  ];
}

function buildDailyTasks(domain: string): DomainData["dailyTasks"] {
  return [
    { title: `Study 1 hour of core ${domain} fundamentals`, duration: "60 min", type: "Learn" },
    { title: "Practice / build for 90 minutes (no tutorials)", duration: "90 min", type: "Build" },
    { title: `Read 1 article or paper from a leader in ${domain}`, duration: "20 min", type: "Learn" },
    { title: "Message 1 professional on LinkedIn (thoughtful, not generic)", duration: "10 min", type: "Network" },
    { title: "Post 1 update on your progress (X, LinkedIn, or blog)", duration: "15 min", type: "Build" },
    { title: "Reflect: what worked, what to change tomorrow", duration: "10 min", type: "Reflect" },
  ];
}

function buildWeeklyGoals(domain: string): string[] {
  return [
    `Complete 1 project milestone in ${domain}`,
    "Have 1 real conversation with a working professional",
    "Publish 1 piece of work publicly (post, repo, sketch, video)",
    "Finish 1 course module or 1 book chapter",
    "Review the week → adjust next week's plan",
  ];
}

function buildLongTerm(domain: string): DomainData["longTermMilestones"] {
  return [
    { year: "Year 1", goal: `Land first role / internship / gig in ${domain}` },
    { year: "Year 3", goal: "Become known for one specific niche" },
    { year: "Year 5", goal: "Senior role, mentor others, deep expertise" },
    { year: "Year 7", goal: "Lead a team or run your own practice" },
    { year: "Year 10", goal: `Top 1% of practitioners in ${domain}` },
  ];
}

function buildResources(domain: string): DomainData["resources"] {
  return [
    { title: `Top 10 books in ${domain}`, type: "Reading" },
    { title: `Best YouTube channels for ${domain}`, type: "Video" },
    { title: `${domain} community Discord & subreddits`, type: "Community" },
    { title: `Curated ${domain} courses`, type: "Course" },
    { title: `Newsletters covering ${domain}`, type: "Newsletter" },
  ];
}

export function getDomainData(slug: string): DomainData | null {
  const name = domains.find((d) => slugifyDomain(d) === slug);
  if (!name) return null;
  const related = careers.filter(
    (c) =>
      c.category.toLowerCase() === name.toLowerCase() ||
      c.industry.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(c.category.toLowerCase()),
  );
  const seed = SEED[slug] ?? {};
  return {
    name,
    slug,
    tagline: seed.tagline ?? `Build a meaningful career in ${name}.`,
    overview:
      seed.overview ??
      `${name} is a fast-evolving domain with diverse roles ranging from entry-level to highly specialized senior positions. AI, globalization, and remote work are reshaping who succeeds.`,
    whyNow: seed.whyNow ?? `Demand for skilled ${name} professionals continues to grow as the industry modernizes.`,
    avgSalary: seed.avgSalary ?? "$55k – $180k",
    growth: seed.growth ?? "+12% YoY",
    demand: seed.demand ?? "High",
    topSkills: seed.topSkills ?? ["Core craft", "Communication", "Tools mastery", "Problem solving", "Continuous learning"],
    topCompanies: seed.topCompanies ?? ["Global leaders", "Top startups", "Public institutions", "Industry-defining brands"],
    relatedCareers: related,
    roadmap: buildRoadmap(name),
    dailyTasks: buildDailyTasks(name),
    weeklyGoals: buildWeeklyGoals(name),
    longTermMilestones: buildLongTerm(name),
    resources: buildResources(name),
  };
}

export const allDomainSlugs = domains.map(slugifyDomain);
