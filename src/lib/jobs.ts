export type Job = {
  id: string;
  title: string;
  company: string;
  logo: string; // emoji stand-in
  industry: "Technology" | "Healthcare" | "Business & Finance" | "Sales & Marketing" | "Trades & Labor" | "Creative & Design";
  arrangement: "Remote" | "Hybrid" | "On-site";
  employment: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience: "Entry-level" | "Mid-level" | "Senior" | "Executive";
  location: string;
  salaryMin: number; // annual USD
  salaryMax: number;
  posted: string; // ISO
  summary: string;
  skills: string[];
  applyUrl?: string;
};

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

export const jobs: Job[] = [
  { id: "j1", title: "Senior Frontend Engineer", company: "Northwind Labs", logo: "🧭", industry: "Technology", arrangement: "Remote", employment: "Full-time", experience: "Senior", location: "Remote — Global", salaryMin: 160000, salaryMax: 210000, posted: iso(1), summary: "Own the design system and ship the next-gen dashboard used by 40k+ teams.", skills: ["React", "TypeScript", "Design Systems"] },
  { id: "j2", title: "AI/ML Engineer", company: "Lumen AI", logo: "✨", industry: "Technology", arrangement: "Hybrid", employment: "Full-time", experience: "Mid-level", location: "San Francisco, CA", salaryMin: 175000, salaryMax: 230000, posted: iso(2), summary: "Ship LLM-powered features end to end — from eval to prod inference at scale.", skills: ["Python", "PyTorch", "LLMs"] },
  { id: "j3", title: "Registered Nurse — ICU", company: "St. Marlowe Hospital", logo: "🩺", industry: "Healthcare", arrangement: "On-site", employment: "Full-time", experience: "Mid-level", location: "Boston, MA", salaryMin: 88000, salaryMax: 118000, posted: iso(3), summary: "Deliver critical care in a 24-bed ICU with a supportive, high-caliber team.", skills: ["Critical Care", "BLS", "ACLS"] },
  { id: "j4", title: "Product Designer", company: "Fable Studio", logo: "🎨", industry: "Creative & Design", arrangement: "Remote", employment: "Full-time", experience: "Mid-level", location: "Remote — US", salaryMin: 120000, salaryMax: 160000, posted: iso(1), summary: "Shape end-to-end product flows for a fast-growing consumer app.", skills: ["Figma", "Prototyping", "Systems"] },
  { id: "j5", title: "B2B Account Executive", company: "Beacon CRM", logo: "📈", industry: "Sales & Marketing", arrangement: "Hybrid", employment: "Full-time", experience: "Mid-level", location: "Austin, TX", salaryMin: 90000, salaryMax: 180000, posted: iso(5), summary: "Own mid-market pipeline with OTE up to $180k and warm inbound leads.", skills: ["SaaS Sales", "Discovery", "Negotiation"] },
  { id: "j6", title: "Warehouse Operations Lead", company: "Cascade Logistics", logo: "📦", industry: "Trades & Labor", arrangement: "On-site", employment: "Full-time", experience: "Mid-level", location: "Reno, NV", salaryMin: 62000, salaryMax: 82000, posted: iso(4), summary: "Lead shift operations for a 200k sqft fulfillment center.", skills: ["Operations", "Safety", "Team Lead"] },
  { id: "j7", title: "Junior Data Analyst", company: "Meridian Finance", logo: "💠", industry: "Business & Finance", arrangement: "Hybrid", employment: "Full-time", experience: "Entry-level", location: "New York, NY", salaryMin: 72000, salaryMax: 92000, posted: iso(2), summary: "Kick off your finance career with mentorship and clear promotion tracks.", skills: ["SQL", "Excel", "Tableau"] },
  { id: "j8", title: "Marketing Intern — Growth", company: "Halo Beauty", logo: "🌸", industry: "Sales & Marketing", arrangement: "Remote", employment: "Internship", experience: "Entry-level", location: "Remote — US", salaryMin: 45000, salaryMax: 55000, posted: iso(6), summary: "Paid 12-week internship on lifecycle & paid social. Convert to FT.", skills: ["Content", "Analytics", "Copywriting"] },
  { id: "j9", title: "Staff Software Engineer", company: "Aperture", logo: "🛰️", industry: "Technology", arrangement: "Remote", employment: "Full-time", experience: "Senior", location: "Remote — EMEA", salaryMin: 210000, salaryMax: 280000, posted: iso(1), summary: "Set architecture direction for the data platform team.", skills: ["Go", "Distributed Systems", "Postgres"] },
  { id: "j10", title: "UX Researcher", company: "Northwind Labs", logo: "🧭", industry: "Creative & Design", arrangement: "Hybrid", employment: "Full-time", experience: "Mid-level", location: "London, UK", salaryMin: 95000, salaryMax: 135000, posted: iso(7), summary: "Run generative and evaluative research shaping our roadmap.", skills: ["Research", "Interviews", "Synthesis"] },
  { id: "j11", title: "Freelance Brand Designer", company: "Various", logo: "🖌️", industry: "Creative & Design", arrangement: "Remote", employment: "Contract", experience: "Mid-level", location: "Remote", salaryMin: 60000, salaryMax: 140000, posted: iso(2), summary: "3–6 month engagements with funded early-stage startups.", skills: ["Brand", "Illustration", "Typography"] },
  { id: "j12", title: "Cybersecurity Analyst", company: "Vaultline", logo: "🛡️", industry: "Technology", arrangement: "On-site", employment: "Full-time", experience: "Mid-level", location: "Washington, DC", salaryMin: 110000, salaryMax: 155000, posted: iso(3), summary: "Detect and respond to threats in a modern SOC.", skills: ["SIEM", "Incident Response", "Threat Intel"] },
  { id: "j13", title: "Physical Therapist", company: "Kinetic Health", logo: "💪", industry: "Healthcare", arrangement: "On-site", employment: "Part-time", experience: "Mid-level", location: "Denver, CO", salaryMin: 55000, salaryMax: 75000, posted: iso(8), summary: "Flexible 20–25 hr/wk role in a modern outpatient clinic.", skills: ["Rehab", "Manual Therapy"] },
  { id: "j14", title: "VP of Engineering", company: "Ember Health", logo: "🔥", industry: "Technology", arrangement: "Hybrid", employment: "Full-time", experience: "Executive", location: "Seattle, WA", salaryMin: 280000, salaryMax: 380000, posted: iso(4), summary: "Lead a 60-person org at a Series C health-tech company.", skills: ["Leadership", "Scaling", "Strategy"] },
  { id: "j15", title: "Content Marketing Manager", company: "Ledger", logo: "📚", industry: "Sales & Marketing", arrangement: "Remote", employment: "Full-time", experience: "Mid-level", location: "Remote — Global", salaryMin: 85000, salaryMax: 120000, posted: iso(5), summary: "Own editorial strategy across blog, newsletter, and thought leadership.", skills: ["SEO", "Writing", "Strategy"] },
  { id: "j16", title: "Electrician Apprentice", company: "BrightGrid", logo: "⚡", industry: "Trades & Labor", arrangement: "On-site", employment: "Full-time", experience: "Entry-level", location: "Phoenix, AZ", salaryMin: 42000, salaryMax: 58000, posted: iso(9), summary: "Paid 4-year apprenticeship — earn while you learn.", skills: ["Electrical", "Safety", "Blueprints"] },
  { id: "j17", title: "Financial Analyst II", company: "Meridian Finance", logo: "💠", industry: "Business & Finance", arrangement: "Hybrid", employment: "Full-time", experience: "Mid-level", location: "New York, NY", salaryMin: 105000, salaryMax: 145000, posted: iso(2), summary: "Model, forecast, and partner with business leaders on strategy.", skills: ["Modeling", "SQL", "FP&A"] },
  { id: "j18", title: "Customer Success Manager", company: "Beacon CRM", logo: "📈", industry: "Sales & Marketing", arrangement: "Remote", employment: "Full-time", experience: "Mid-level", location: "Remote — US", salaryMin: 85000, salaryMax: 125000, posted: iso(3), summary: "Own a $2M book of high-growth SaaS customers.", skills: ["Onboarding", "QBRs", "Retention"] },
  { id: "j19", title: "Backend Engineer (Node)", company: "Aperture", logo: "🛰️", industry: "Technology", arrangement: "Remote", employment: "Full-time", experience: "Mid-level", location: "Remote — Americas", salaryMin: 135000, salaryMax: 180000, posted: iso(1), summary: "Ship reliable APIs powering millions of daily requests.", skills: ["Node.js", "Postgres", "AWS"] },
  { id: "j20", title: "Motion Designer", company: "Fable Studio", logo: "🎨", industry: "Creative & Design", arrangement: "Remote", employment: "Contract", experience: "Mid-level", location: "Remote", salaryMin: 70000, salaryMax: 110000, posted: iso(6), summary: "Craft delightful micro-animations for a top-100 consumer app.", skills: ["After Effects", "Lottie", "Cinema 4D"] },
  { id: "j21", title: "Medical Assistant", company: "St. Marlowe Hospital", logo: "🩺", industry: "Healthcare", arrangement: "On-site", employment: "Full-time", experience: "Entry-level", location: "Boston, MA", salaryMin: 42000, salaryMax: 58000, posted: iso(4), summary: "Entry into healthcare with tuition assistance and clear growth path.", skills: ["Vitals", "EMR", "Patient Care"] },
  { id: "j22", title: "Solutions Architect", company: "Vaultline", logo: "🛡️", industry: "Technology", arrangement: "Hybrid", employment: "Full-time", experience: "Senior", location: "Washington, DC", salaryMin: 170000, salaryMax: 230000, posted: iso(5), summary: "Own pre-sales architecture for enterprise security deployments.", skills: ["Architecture", "Cloud", "Presales"] },
  { id: "j23", title: "HR Business Partner", company: "Ember Health", logo: "🔥", industry: "Business & Finance", arrangement: "Hybrid", employment: "Full-time", experience: "Senior", location: "Seattle, WA", salaryMin: 130000, salaryMax: 175000, posted: iso(7), summary: "Coach leaders across a 400-person growth-stage company.", skills: ["HR", "Coaching", "Comp"] },
  { id: "j24", title: "CNC Machinist", company: "Cascade Logistics", logo: "📦", industry: "Trades & Labor", arrangement: "On-site", employment: "Full-time", experience: "Mid-level", location: "Reno, NV", salaryMin: 58000, salaryMax: 78000, posted: iso(2), summary: "3-axis and 5-axis CNC operations, day or swing shifts.", skills: ["CNC", "GD&T", "Blueprints"] },
  { id: "j25", title: "Growth PM", company: "Ledger", logo: "📚", industry: "Business & Finance", arrangement: "Remote", employment: "Full-time", experience: "Senior", location: "Remote — Global", salaryMin: 160000, salaryMax: 220000, posted: iso(1), summary: "Own top-of-funnel activation for a fintech serving 2M users.", skills: ["Experimentation", "SQL", "Roadmap"] },
];

export const INDUSTRIES = ["Technology", "Healthcare", "Business & Finance", "Sales & Marketing", "Trades & Labor", "Creative & Design"] as const;
export const ARRANGEMENTS = ["Remote", "Hybrid", "On-site"] as const;
export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;
export const EXPERIENCE_LEVELS = ["Entry-level", "Mid-level", "Senior", "Executive"] as const;

export function formatSalary(min: number, max: number) {
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  return `${k(min)} – ${k(max)}`;
}

export function relativeTime(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d <= 0) return "today";
  if (d === 1) return "1 day ago";
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  return w === 1 ? "1 week ago" : `${w} weeks ago`;
}
