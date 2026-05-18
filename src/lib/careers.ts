export type Career = {
  slug: string;
  title: string;
  match: number;
  salary: string;
  growth: string;
  demand: "Extreme" | "High" | "Moderate";
  skills: string[];
  summary: string;
  industry: string;
};

export const careers: Career[] = [
  { slug: "ai-engineer", title: "AI Engineer", match: 96, salary: "$145k – $210k", growth: "+38% YoY", demand: "Extreme", skills: ["Python", "PyTorch", "LLMs", "MLOps"], summary: "Build, train, and deploy intelligent systems and LLM-powered products.", industry: "Technology" },
  { slug: "data-scientist", title: "Data Scientist", match: 92, salary: "$120k – $180k", growth: "+24% YoY", demand: "High", skills: ["Python", "SQL", "Statistics", "Pandas"], summary: "Turn raw data into business insights and predictive models.", industry: "Technology" },
  { slug: "software-engineer", title: "Software Engineer", match: 90, salary: "$110k – $190k", growth: "+18% YoY", demand: "High", skills: ["TypeScript", "React", "Node.js", "AWS"], summary: "Design and ship production-grade software at scale.", industry: "Technology" },
  { slug: "cybersecurity-expert", title: "Cybersecurity Expert", match: 88, salary: "$115k – $185k", growth: "+40% YoY", demand: "Extreme", skills: ["Networking", "Pen Testing", "SIEM", "Zero Trust"], summary: "Defend organizations from emerging digital threats.", industry: "Security" },
  { slug: "cloud-engineer", title: "Cloud Engineer", match: 85, salary: "$125k – $195k", growth: "+27% YoY", demand: "High", skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"], summary: "Architect resilient distributed systems on the cloud.", industry: "Infrastructure" },
  { slug: "uiux-designer", title: "UI/UX Designer", match: 83, salary: "$85k – $150k", growth: "+15% YoY", demand: "High", skills: ["Figma", "Research", "Prototyping", "Design Systems"], summary: "Craft interfaces people love to use every day.", industry: "Design" },
  { slug: "business-analyst", title: "Business Analyst", match: 80, salary: "$80k – $140k", growth: "+12% YoY", demand: "High", skills: ["SQL", "Excel", "Tableau", "Process Mapping"], summary: "Bridge business goals and technical execution.", industry: "Business" },
  { slug: "digital-marketer", title: "Digital Marketer", match: 78, salary: "$60k – $130k", growth: "+14% YoY", demand: "High", skills: ["SEO", "Ads", "Analytics", "Content"], summary: "Grow brands through data-driven campaigns.", industry: "Marketing" },
  { slug: "game-developer", title: "Game Developer", match: 76, salary: "$80k – $160k", growth: "+10% YoY", demand: "Moderate", skills: ["Unity", "C#", "Unreal", "3D Math"], summary: "Build immersive interactive worlds and gameplay systems.", industry: "Entertainment" },
  { slug: "animator", title: "Animator", match: 74, salary: "$55k – $120k", growth: "+8% YoY", demand: "Moderate", skills: ["After Effects", "Blender", "Storyboarding"], summary: "Bring stories and characters to life through motion.", industry: "Creative" },
  { slug: "content-creator", title: "Content Creator", match: 72, salary: "$40k – $200k+", growth: "+22% YoY", demand: "High", skills: ["Video", "Editing", "Storytelling", "Branding"], summary: "Build an audience and monetize creative work.", industry: "Media" },
  { slug: "doctor", title: "Doctor", match: 70, salary: "$200k – $400k", growth: "+7% YoY", demand: "High", skills: ["Biology", "Diagnostics", "Empathy", "Decision-making"], summary: "Diagnose and treat patients across specialties.", industry: "Healthcare" },
  { slug: "lawyer", title: "Lawyer", match: 68, salary: "$110k – $250k", growth: "+5% YoY", demand: "Moderate", skills: ["Research", "Writing", "Negotiation", "Critical Thinking"], summary: "Advise and advocate within complex legal systems.", industry: "Legal" },
  { slug: "mechanical-engineer", title: "Mechanical Engineer", match: 66, salary: "$80k – $140k", growth: "+6% YoY", demand: "Moderate", skills: ["CAD", "Thermodynamics", "Manufacturing"], summary: "Design and analyze mechanical systems and products.", industry: "Engineering" },
  { slug: "civil-engineer", title: "Civil Engineer", match: 64, salary: "$75k – $130k", growth: "+5% YoY", demand: "Moderate", skills: ["AutoCAD", "Structural Analysis", "Project Mgmt"], summary: "Plan and build the infrastructure of modern cities.", industry: "Engineering" },
];

export const skillsRadar = [
  { skill: "Problem Solving", you: 84, market: 90 },
  { skill: "Python", you: 78, market: 88 },
  { skill: "System Design", you: 62, market: 80 },
  { skill: "ML / AI", you: 55, market: 92 },
  { skill: "Communication", you: 80, market: 75 },
  { skill: "Cloud / DevOps", you: 48, market: 78 },
];

export const trends = [
  { industry: "Artificial Intelligence", change: "+38%", color: "primary" },
  { industry: "Cybersecurity", change: "+34%", color: "accent" },
  { industry: "Cloud Infrastructure", change: "+27%", color: "primary" },
  { industry: "Data & Analytics", change: "+24%", color: "accent" },
  { industry: "Renewable Energy", change: "+19%", color: "primary" },
  { industry: "Healthcare Tech", change: "+17%", color: "accent" },
];

export const roadmap = [
  { phase: "Phase 01", title: "Foundations", duration: "0–3 months", items: ["Python fundamentals", "Linear algebra refresh", "Git & GitHub flow", "Build 2 portfolio projects"], status: "active" as const },
  { phase: "Phase 02", title: "Core Specialization", duration: "3–6 months", items: ["Deep learning with PyTorch", "Transformer architectures", "Model evaluation & metrics", "Deploy a small ML service"], status: "upcoming" as const },
  { phase: "Phase 03", title: "Production Systems", duration: "6–9 months", items: ["MLOps with Docker + K8s", "LLM ops & vector databases", "Monitoring & cost control", "Capstone: production AI app"], status: "upcoming" as const },
  { phase: "Phase 04", title: "Land the Role", duration: "9–12 months", items: ["System design interviews", "Open source contributions", "Resume + portfolio polish", "Targeted outreach + offers"], status: "upcoming" as const },
];

export const courses = [
  { title: "Deep Learning Specialization", provider: "DeepLearning.AI", duration: "12 weeks", level: "Intermediate", price: "$49/mo", tag: "AI" },
  { title: "AWS Solutions Architect", provider: "AWS", duration: "8 weeks", level: "Advanced", price: "$120", tag: "Cloud" },
  { title: "Frontend System Design", provider: "Frontend Masters", duration: "6 weeks", level: "Advanced", price: "$39/mo", tag: "Engineering" },
  { title: "Product Design Bootcamp", provider: "Designlab", duration: "16 weeks", level: "Beginner", price: "$899", tag: "Design" },
  { title: "Practical SQL for Data", provider: "Mode Analytics", duration: "4 weeks", level: "Beginner", price: "Free", tag: "Data" },
  { title: "Offensive Security Certified", provider: "OffSec", duration: "12 weeks", level: "Advanced", price: "$1,499", tag: "Security" },
];
