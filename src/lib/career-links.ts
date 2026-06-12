import {
  Code2, ShieldCheck, BarChart3, Brain, Briefcase,
  Github, Twitter, Linkedin, Youtube, MessageSquare, GraduationCap, BookOpen, Users,
  type LucideIcon,
} from "lucide-react";

export type CareerKey = "frontend" | "cybersecurity" | "data-science" | "ai-ml" | "product";

export type CareerLink = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export type SocialLink = {
  platform: string;
  href: string;
  handle: string;
  icon: LucideIcon;
};

export type CareerProfile = {
  key: CareerKey;
  label: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;       // tailwind text color
  accentBg: string;     // tailwind bg color (translucent)
  glow: string;         // rgba glow color
  learning: CareerLink;
  videos: CareerLink;
  network: CareerLink;
  community: CareerLink;
  socials: SocialLink[];
};

export const CAREERS: Record<CareerKey, CareerProfile> = {
  frontend: {
    key: "frontend",
    label: "Frontend Development",
    tagline: "Ship beautiful, performant interfaces.",
    icon: Code2,
    accent: "text-indigo-600",
    accentBg: "bg-indigo-500/10",
    glow: "rgba(99, 102, 241, 0.45)",
    learning: { href: "https://roadmap.sh/frontend", label: "Frontend Roadmap", description: "Industry-standard learning path with curated milestones.", icon: GraduationCap },
    videos:   { href: "https://www.youtube.com/@KevinPowell", label: "Kevin Powell — CSS Mastery", description: "Advanced CSS, layout, and modern web styling.", icon: Youtube },
    network:  { href: "https://github.com/topics/frontend", label: "GitHub Frontend Topic", description: "Trending repos, OSS projects, and contributors.", icon: Github },
    community:{ href: "https://discord.gg/frontend", label: "Frontend Developers Discord", description: "Active circle for UI/UX, React, and tooling chats.", icon: MessageSquare },
    socials: [
      { platform: "GitHub", href: "https://github.com/topics/react", handle: "topics/react", icon: Github },
      { platform: "X / Twitter", href: "https://twitter.com/i/communities/1493778455741460481", handle: "Frontend Devs", icon: Twitter },
      { platform: "LinkedIn", href: "https://www.linkedin.com/groups/961597/", handle: "Front End Developers", icon: Linkedin },
      { platform: "YouTube", href: "https://www.youtube.com/@Fireship", handle: "@Fireship", icon: Youtube },
    ],
  },
  cybersecurity: {
    key: "cybersecurity",
    label: "Cybersecurity",
    tagline: "Defend systems. Break things ethically.",
    icon: ShieldCheck,
    accent: "text-emerald-600",
    accentBg: "bg-emerald-500/10",
    glow: "rgba(16, 185, 129, 0.45)",
    learning: { href: "https://tryhackme.com/", label: "TryHackMe", description: "Hands-on labs from beginner to red-team operator.", icon: GraduationCap },
    videos:   { href: "https://www.youtube.com/@_JohnHammond", label: "John Hammond — Hacking", description: "CTF walkthroughs, malware analysis, and offensive sec.", icon: Youtube },
    network:  { href: "https://www.hackthebox.com/", label: "Hack The Box", description: "Pro labs, certifications, and active hacker network.", icon: ShieldCheck },
    community:{ href: "https://discord.gg/infosec", label: "InfoSec Prep Discord", description: "Cert study groups, OSCP prep, and CVE chatter.", icon: MessageSquare },
    socials: [
      { platform: "GitHub", href: "https://github.com/topics/cybersecurity", handle: "topics/cybersecurity", icon: Github },
      { platform: "X / Twitter", href: "https://twitter.com/i/communities/1471541128842027010", handle: "InfoSec", icon: Twitter },
      { platform: "LinkedIn", href: "https://www.linkedin.com/groups/37081/", handle: "Information Security Community", icon: Linkedin },
      { platform: "YouTube", href: "https://www.youtube.com/@NetworkChuck", handle: "@NetworkChuck", icon: Youtube },
    ],
  },
  "data-science": {
    key: "data-science",
    label: "Data Science",
    tagline: "Turn raw data into decisions.",
    icon: BarChart3,
    accent: "text-sky-600",
    accentBg: "bg-sky-500/10",
    glow: "rgba(14, 165, 233, 0.45)",
    learning: { href: "https://www.kaggle.com/learn", label: "Kaggle Learn", description: "Free micro-courses on ML, SQL, and data viz.", icon: GraduationCap },
    videos:   { href: "https://www.youtube.com/@StatQuest", label: "StatQuest with Josh Starmer", description: "Statistics and ML explained intuitively.", icon: Youtube },
    network:  { href: "https://github.com/topics/data-science", label: "GitHub Data Science Topic", description: "Notebooks, datasets, and research code.", icon: Github },
    community:{ href: "https://discord.gg/kaggle", label: "Kaggle Community Discord", description: "Competitions, study groups, and dataset deep-dives.", icon: MessageSquare },
    socials: [
      { platform: "GitHub", href: "https://github.com/topics/machine-learning", handle: "topics/ml", icon: Github },
      { platform: "X / Twitter", href: "https://twitter.com/i/communities/1499205326032838657", handle: "Data Science", icon: Twitter },
      { platform: "LinkedIn", href: "https://www.linkedin.com/groups/35222/", handle: "Data Science Central", icon: Linkedin },
      { platform: "YouTube", href: "https://www.youtube.com/@3blue1brown", handle: "@3blue1brown", icon: Youtube },
    ],
  },
  "ai-ml": {
    key: "ai-ml",
    label: "AI / ML Engineering",
    tagline: "Build the models behind tomorrow.",
    icon: Brain,
    accent: "text-fuchsia-600",
    accentBg: "bg-fuchsia-500/10",
    glow: "rgba(217, 70, 239, 0.45)",
    learning: { href: "https://www.deeplearning.ai/courses/", label: "DeepLearning.AI Courses", description: "Andrew Ng's specialization tracks for ML engineers.", icon: GraduationCap },
    videos:   { href: "https://www.youtube.com/@AndrejKarpathy", label: "Andrej Karpathy — Neural Nets", description: "From-scratch transformer and GPT lectures.", icon: Youtube },
    network:  { href: "https://huggingface.co/", label: "Hugging Face Hub", description: "Models, datasets, and the open-source ML community.", icon: BookOpen },
    community:{ href: "https://discord.gg/huggingface", label: "Hugging Face Discord", description: "Research papers, fine-tuning help, and demos.", icon: MessageSquare },
    socials: [
      { platform: "GitHub", href: "https://github.com/topics/llm", handle: "topics/llm", icon: Github },
      { platform: "X / Twitter", href: "https://twitter.com/i/communities/1559453750285225984", handle: "AI Builders", icon: Twitter },
      { platform: "LinkedIn", href: "https://www.linkedin.com/groups/4298552/", handle: "AI, ML & Data Science", icon: Linkedin },
      { platform: "YouTube", href: "https://www.youtube.com/@TwoMinutePapers", handle: "@TwoMinutePapers", icon: Youtube },
    ],
  },
  product: {
    key: "product",
    label: "Product Management",
    tagline: "Discover what to build and why.",
    icon: Briefcase,
    accent: "text-amber-600",
    accentBg: "bg-amber-500/10",
    glow: "rgba(245, 158, 11, 0.45)",
    learning: { href: "https://www.reforge.com/", label: "Reforge Programs", description: "Senior PM curricula from operators at top tech.", icon: GraduationCap },
    videos:   { href: "https://www.youtube.com/@LennysPodcast", label: "Lenny's Podcast", description: "Interviews with world-class product leaders.", icon: Youtube },
    network:  { href: "https://www.mindtheproduct.com/", label: "Mind the Product", description: "Global PM community, events, and resources.", icon: Users },
    community:{ href: "https://discord.gg/product", label: "Product Coalition Discord", description: "Frameworks, mentorship, and PM career chat.", icon: MessageSquare },
    socials: [
      { platform: "GitHub", href: "https://github.com/topics/product-management", handle: "topics/product", icon: Github },
      { platform: "X / Twitter", href: "https://twitter.com/i/communities/1493446837214187521", handle: "Product Builders", icon: Twitter },
      { platform: "LinkedIn", href: "https://www.linkedin.com/groups/47565/", handle: "Product Management Network", icon: Linkedin },
      { platform: "YouTube", href: "https://www.youtube.com/@ProductSchool", handle: "@ProductSchool", icon: Youtube },
    ],
  },
};

export const CAREER_LIST = Object.values(CAREERS);
