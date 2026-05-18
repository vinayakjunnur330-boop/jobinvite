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
  category: string;
};

export const domains = [
  "Technology", "Medical", "Business", "Finance", "Government", "Design",
  "Law", "Marketing", "Creative", "Gaming", "Animation", "Film", "Music",
  "Sports", "Education", "Psychology", "Architecture", "Aviation",
  "Hospitality", "Agriculture", "Biotech", "Fashion", "Journalism",
  "Data & AI", "Cybersecurity", "Cloud", "Robotics", "UX", "Digital Marketing",
  "Social Media", "Entrepreneurship", "E-commerce", "Accounting",
  "Civil Services", "Defense", "Photography", "Events", "Fitness",
  "Culinary", "Research", "International", "Freelance", "Remote", "Startup",
];

export const careers: Career[] = [
  { slug: "ai-engineer", title: "AI Engineer", match: 96, salary: "$145k – $210k", growth: "+38% YoY", demand: "Extreme", skills: ["Python", "PyTorch", "LLMs", "MLOps"], summary: "Build, train, and deploy intelligent systems and LLM-powered products.", industry: "Artificial Intelligence", category: "Technology" },
  { slug: "data-scientist", title: "Data Scientist", match: 92, salary: "$120k – $180k", growth: "+24% YoY", demand: "High", skills: ["Python", "SQL", "Statistics"], summary: "Turn raw data into business insights and predictive models.", industry: "Data & AI", category: "Technology" },
  { slug: "software-engineer", title: "Software Engineer", match: 90, salary: "$110k – $190k", growth: "+18% YoY", demand: "High", skills: ["TypeScript", "React", "Node.js"], summary: "Design and ship production-grade software at scale.", industry: "Engineering", category: "Technology" },
  { slug: "cybersecurity-expert", title: "Cybersecurity Expert", match: 88, salary: "$115k – $185k", growth: "+40% YoY", demand: "Extreme", skills: ["Networking", "Pen Testing", "Zero Trust"], summary: "Defend organizations from emerging digital threats.", industry: "Security", category: "Technology" },
  { slug: "cloud-engineer", title: "Cloud Engineer", match: 85, salary: "$125k – $195k", growth: "+27% YoY", demand: "High", skills: ["AWS", "K8s", "Terraform"], summary: "Architect resilient distributed systems on the cloud.", industry: "Cloud", category: "Technology" },
  { slug: "uiux-designer", title: "UI/UX Designer", match: 89, salary: "$85k – $150k", growth: "+15% YoY", demand: "High", skills: ["Figma", "Research", "Prototyping"], summary: "Craft interfaces people love to use every day.", industry: "Design", category: "Design" },
  { slug: "product-designer", title: "Product Designer", match: 87, salary: "$95k – $170k", growth: "+18% YoY", demand: "High", skills: ["Figma", "Systems", "Strategy"], summary: "Shape end-to-end product experiences from concept to ship.", industry: "Design", category: "Design" },
  { slug: "doctor", title: "Doctor / Surgeon", match: 91, salary: "$200k – $400k", growth: "+7% YoY", demand: "High", skills: ["Biology", "Diagnostics", "Empathy"], summary: "Diagnose and treat patients across specialties.", industry: "Healthcare", category: "Medical" },
  { slug: "nurse", title: "Registered Nurse", match: 82, salary: "$75k – $130k", growth: "+9% YoY", demand: "High", skills: ["Patient Care", "Pharmacology"], summary: "Front-line healthcare and patient advocacy.", industry: "Healthcare", category: "Medical" },
  { slug: "biotech-researcher", title: "Biotech Researcher", match: 84, salary: "$90k – $160k", growth: "+16% YoY", demand: "High", skills: ["Genomics", "CRISPR", "Lab Ops"], summary: "Engineer biology to solve real-world problems.", industry: "Biotech", category: "Medical" },
  { slug: "lawyer", title: "Lawyer", match: 78, salary: "$110k – $250k", growth: "+5% YoY", demand: "Moderate", skills: ["Research", "Writing", "Negotiation"], summary: "Advise and advocate within complex legal systems.", industry: "Legal", category: "Law" },
  { slug: "ca", title: "Chartered Accountant", match: 80, salary: "$70k – $180k", growth: "+8% YoY", demand: "High", skills: ["Audit", "Tax", "GAAP"], summary: "Master of financial truth for organizations.", industry: "Finance", category: "Finance" },
  { slug: "investment-banker", title: "Investment Banker", match: 79, salary: "$130k – $400k", growth: "+10% YoY", demand: "High", skills: ["Modeling", "Valuation", "M&A"], summary: "Architect deals that move global capital.", industry: "Finance", category: "Finance" },
  { slug: "civil-services", title: "Civil Services Officer", match: 81, salary: "Govt Scale", growth: "Stable", demand: "High", skills: ["Policy", "Leadership", "Ethics"], summary: "Lead public administration and nation-building.", industry: "Government", category: "Government" },
  { slug: "pilot", title: "Commercial Pilot", match: 86, salary: "$120k – $300k", growth: "+11% YoY", demand: "High", skills: ["Navigation", "Decision-making"], summary: "Command the skies on long and short-haul routes.", industry: "Aviation", category: "Aviation" },
  { slug: "architect", title: "Architect", match: 77, salary: "$80k – $160k", growth: "+8% YoY", demand: "Moderate", skills: ["CAD", "Structure", "Aesthetics"], summary: "Design the spaces where humanity lives and works.", industry: "Architecture", category: "Architecture" },
  { slug: "digital-marketer", title: "Digital Marketer", match: 83, salary: "$60k – $130k", growth: "+14% YoY", demand: "High", skills: ["SEO", "Ads", "Analytics"], summary: "Grow brands through data-driven campaigns.", industry: "Marketing", category: "Marketing" },
  { slug: "content-creator", title: "Content Creator", match: 85, salary: "$40k – $200k+", growth: "+22% YoY", demand: "High", skills: ["Video", "Storytelling", "Branding"], summary: "Build an audience and monetize creative work.", industry: "Media", category: "Creative" },
  { slug: "game-developer", title: "Game Developer", match: 82, salary: "$80k – $160k", growth: "+10% YoY", demand: "High", skills: ["Unity", "C#", "3D Math"], summary: "Build immersive interactive worlds.", industry: "Gaming", category: "Gaming" },
  { slug: "animator", title: "3D Animator", match: 79, salary: "$55k – $120k", growth: "+8% YoY", demand: "Moderate", skills: ["Blender", "Rigging", "Motion"], summary: "Bring stories and characters to life.", industry: "Animation", category: "Animation" },
  { slug: "film-director", title: "Film Director", match: 75, salary: "$60k – $250k+", growth: "+6% YoY", demand: "Moderate", skills: ["Vision", "Storytelling", "Leadership"], summary: "Translate scripts into cinematic moments.", industry: "Film", category: "Film" },
  { slug: "musician", title: "Music Producer", match: 73, salary: "$45k – $200k+", growth: "+9% YoY", demand: "Moderate", skills: ["DAW", "Mixing", "Composition"], summary: "Shape sound across genres and platforms.", industry: "Music", category: "Music" },
  { slug: "athlete", title: "Professional Athlete", match: 70, salary: "$50k – $5M+", growth: "+5% YoY", demand: "Moderate", skills: ["Training", "Discipline", "Strategy"], summary: "Compete at the highest levels of human performance.", industry: "Sports", category: "Sports" },
  { slug: "teacher", title: "Educator", match: 78, salary: "$50k – $110k", growth: "+6% YoY", demand: "High", skills: ["Pedagogy", "Empathy", "Curriculum"], summary: "Shape the next generation through learning.", industry: "Education", category: "Education" },
  { slug: "psychologist", title: "Clinical Psychologist", match: 80, salary: "$80k – $160k", growth: "+11% YoY", demand: "High", skills: ["Therapy", "Research", "Empathy"], summary: "Help people navigate the architecture of mind.", industry: "Psychology", category: "Psychology" },
  { slug: "hotel-manager", title: "Hotel Manager", match: 74, salary: "$60k – $140k", growth: "+7% YoY", demand: "Moderate", skills: ["Ops", "Hospitality", "Leadership"], summary: "Run world-class guest experiences end to end.", industry: "Hospitality", category: "Hospitality" },
  { slug: "agritech", title: "AgriTech Specialist", match: 72, salary: "$60k – $130k", growth: "+12% YoY", demand: "Moderate", skills: ["IoT", "Agronomy", "Data"], summary: "Reinvent farming with intelligent systems.", industry: "Agriculture", category: "Agriculture" },
  { slug: "fashion-designer", title: "Fashion Designer", match: 76, salary: "$55k – $200k+", growth: "+8% YoY", demand: "Moderate", skills: ["Sketching", "Textiles", "Trends"], summary: "Define what the world wears next.", industry: "Fashion", category: "Fashion" },
  { slug: "journalist", title: "Investigative Journalist", match: 71, salary: "$50k – $120k", growth: "+4% YoY", demand: "Moderate", skills: ["Writing", "Research", "Interviewing"], summary: "Hold power accountable through reporting.", industry: "Journalism", category: "Journalism" },
  { slug: "robotics-engineer", title: "Robotics Engineer", match: 89, salary: "$110k – $200k", growth: "+28% YoY", demand: "Extreme", skills: ["ROS", "Control Theory", "CAD"], summary: "Build machines that perceive, decide, and act.", industry: "Robotics", category: "Technology" },
  { slug: "social-media-manager", title: "Social Media Strategist", match: 80, salary: "$55k – $130k", growth: "+19% YoY", demand: "High", skills: ["Content", "Analytics", "Community"], summary: "Architect viral, on-brand storytelling.", industry: "Social Media", category: "Marketing" },
  { slug: "entrepreneur", title: "Startup Founder", match: 84, salary: "Variable", growth: "+High Upside", demand: "High", skills: ["Vision", "Sales", "Resilience"], summary: "Build companies from zero to one.", industry: "Entrepreneurship", category: "Business" },
  { slug: "ecommerce", title: "E-commerce Lead", match: 78, salary: "$70k – $160k", growth: "+15% YoY", demand: "High", skills: ["Shopify", "CRO", "Ads"], summary: "Scale modern online retail brands.", industry: "E-commerce", category: "Business" },
  { slug: "defense-officer", title: "Defense Officer", match: 75, salary: "Govt Scale", growth: "Stable", demand: "High", skills: ["Leadership", "Fitness", "Strategy"], summary: "Serve and lead in Army / Navy / Air Force.", industry: "Defense", category: "Government" },
  { slug: "photographer", title: "Commercial Photographer", match: 72, salary: "$45k – $150k", growth: "+6% YoY", demand: "Moderate", skills: ["Lighting", "Editing", "Composition"], summary: "Capture moments brands and people remember.", industry: "Photography", category: "Creative" },
  { slug: "event-manager", title: "Event Manager", match: 70, salary: "$50k – $120k", growth: "+8% YoY", demand: "Moderate", skills: ["Planning", "Vendors", "Ops"], summary: "Produce experiences from concept to curtain.", industry: "Events", category: "Hospitality" },
  { slug: "fitness-coach", title: "Fitness Coach", match: 74, salary: "$40k – $150k+", growth: "+13% YoY", demand: "High", skills: ["Anatomy", "Programming", "Motivation"], summary: "Engineer human performance and longevity.", industry: "Fitness", category: "Fitness" },
  { slug: "chef", title: "Executive Chef", match: 76, salary: "$60k – $200k+", growth: "+7% YoY", demand: "Moderate", skills: ["Technique", "Palate", "Leadership"], summary: "Lead kitchens and define modern cuisine.", industry: "Culinary", category: "Culinary" },
  { slug: "scientist", title: "Research Scientist", match: 81, salary: "$90k – $180k", growth: "+11% YoY", demand: "High", skills: ["Method", "Writing", "Lab"], summary: "Push the boundary of what humans know.", industry: "Research", category: "Research" },
  { slug: "freelancer", title: "Freelance Specialist", match: 79, salary: "$40k – $250k+", growth: "+20% YoY", demand: "High", skills: ["Craft", "Sales", "Self-direction"], summary: "Own your time and ship for global clients.", industry: "Freelance", category: "Freelance" },
];

export const categoryImages: Record<string, string> = {
  Technology: "ai",
  Medical: "medical",
  Design: "design",
  Aviation: "aviation",
  Sports: "sports",
  Business: "business",
};

export const skillsRadar = [
  { skill: "Problem Solving", you: 84, market: 90 },
  { skill: "Python", you: 78, market: 88 },
  { skill: "System Design", you: 62, market: 80 },
  { skill: "ML / AI", you: 55, market: 92 },
  { skill: "Communication", you: 80, market: 75 },
  { skill: "Cloud / DevOps", you: 48, market: 78 },
];

export const trends = [
  { industry: "Artificial Intelligence", change: "+38%", color: "primary" as const },
  { industry: "Cybersecurity", change: "+34%", color: "accent" as const },
  { industry: "Cloud Infrastructure", change: "+27%", color: "primary" as const },
  { industry: "Data & Analytics", change: "+24%", color: "accent" as const },
  { industry: "Renewable Energy", change: "+19%", color: "primary" as const },
  { industry: "Healthcare Tech", change: "+17%", color: "accent" as const },
  { industry: "Creator Economy", change: "+22%", color: "primary" as const },
  { industry: "Biotech", change: "+16%", color: "accent" as const },
];

export const futureJobs = [
  { title: "AI Ethics Officer", year: "2026", demand: 94 },
  { title: "Synthetic Biologist", year: "2027", demand: 88 },
  { title: "Climate Solutions Architect", year: "2026", demand: 91 },
  { title: "Space Operations Engineer", year: "2028", demand: 82 },
  { title: "Quantum Software Developer", year: "2028", demand: 86 },
  { title: "AR/VR Experience Designer", year: "2026", demand: 89 },
];

export const testimonials = [
  { name: "Priya S.", role: "Now AI Engineer @ Google", quote: "CareerPilot saw what 4 years of college never told me. The roadmap was surgical." },
  { name: "Marcus L.", role: "Pivoted from finance → product design", quote: "I switched careers at 32. The assessment matched me to roles I hadn't even heard of." },
  { name: "Ananya R.", role: "Med student, AIIMS", quote: "It mapped my strengths into specializations I'd never considered. Game changer." },
  { name: "Diego M.", role: "Game Developer @ Ubisoft", quote: "Resume scan + skill gap report landed me 3 offers in 6 weeks." },
  { name: "Lena K.", role: "Founder, fashion startup", quote: "The entrepreneurship track is the most honest career advice I've ever paid nothing for." },
];

export const stats = [
  { label: "Career paths mapped", value: 2400, suffix: "+" },
  { label: "Students guided", value: 187000, suffix: "+" },
  { label: "Match accuracy", value: 94, suffix: "%" },
  { label: "Industries covered", value: 44, suffix: "" },
];

export const roadmap = [
  { phase: "Phase 01", title: "Foundations", duration: "0–3 months", items: ["Core fundamentals", "Tool mastery", "Build 2 portfolio projects"], status: "active" as const },
  { phase: "Phase 02", title: "Specialization", duration: "3–6 months", items: ["Deep domain skills", "First real-world project", "Network with 20 people in field"], status: "upcoming" as const },
  { phase: "Phase 03", title: "Production", duration: "6–9 months", items: ["Ship a capstone", "Open source / public work", "Niche expertise"], status: "upcoming" as const },
  { phase: "Phase 04", title: "Land the Role", duration: "9–12 months", items: ["Interview prep", "Portfolio polish", "Targeted outreach + offers"], status: "upcoming" as const },
];

export const courses = [
  { title: "Deep Learning Specialization", provider: "DeepLearning.AI", duration: "12 weeks", level: "Intermediate", price: "$49/mo", tag: "AI" },
  { title: "AWS Solutions Architect", provider: "AWS", duration: "8 weeks", level: "Advanced", price: "$120", tag: "Cloud" },
  { title: "Frontend System Design", provider: "Frontend Masters", duration: "6 weeks", level: "Advanced", price: "$39/mo", tag: "Engineering" },
  { title: "Product Design Bootcamp", provider: "Designlab", duration: "16 weeks", level: "Beginner", price: "$899", tag: "Design" },
  { title: "Practical SQL for Data", provider: "Mode Analytics", duration: "4 weeks", level: "Beginner", price: "Free", tag: "Data" },
  { title: "Offensive Security Certified", provider: "OffSec", duration: "12 weeks", level: "Advanced", price: "$1,499", tag: "Security" },
];
