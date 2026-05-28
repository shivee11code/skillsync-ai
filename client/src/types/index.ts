export interface User {
  id: string;
  name: string;
  email: string;
  goalRole: string;
  currentSkills: string[];
  xp: number;
  streak: number;
}

export interface SkillNode {
  skillName: string;
  status: "completed" | "inProgress" | "missing";
  proficiencyLevel: "beginner" | "intermediate" | "advanced";
  resources: string[];
  estimatedWeeks: number;
}

export interface Project {
  title: string;
  difficulty: string;
  techStack: string[];
  description: string;
}

export interface Roadmap {
  _id: string;
  userId: string;
  goalRole: string;
  skills: SkillNode[];
  projects: Project[];
  totalXp: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const GOAL_ROLES = [
  "Full Stack SDE",
  "Frontend Developer",
  "Backend Developer",
  "AI Engineer",
  "Data Scientist",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Mobile App Developer",
] as const;

export type GoalRole = (typeof GOAL_ROLES)[number];

export const ROLE_META: Record<string, { icon: string; desc: string; color: string }> = {
  "Full Stack SDE":       { icon: "🌐", desc: "Web apps, APIs & databases",         color: "from-blue-500 to-cyan-500" },
  "Frontend Developer":   { icon: "🎨", desc: "UI, React, Next.js & design systems", color: "from-pink-500 to-rose-500" },
  "Backend Developer":    { icon: "⚙️",  desc: "APIs, databases & system design",    color: "from-orange-500 to-amber-500" },
  "AI Engineer":          { icon: "🤖", desc: "LLMs, ML models & AI systems",        color: "from-violet-500 to-purple-500" },
  "Data Scientist":       { icon: "📊", desc: "Data analysis, ML & insights",        color: "from-green-500 to-emerald-500" },
  "DevOps Engineer":      { icon: "🔧", desc: "CI/CD, Docker & infrastructure",      color: "from-yellow-500 to-orange-500" },
  "Cloud Engineer":       { icon: "☁️",  desc: "AWS, Azure & cloud architecture",    color: "from-sky-500 to-blue-500" },
  "Cybersecurity Analyst":{ icon: "🔒", desc: "Ethical hacking, pentesting & SIEM",  color: "from-red-500 to-rose-500" },
  "Mobile App Developer": { icon: "📱", desc: "React Native, Expo & app stores",     color: "from-indigo-500 to-violet-500" },
};

export const SKILL_OPTIONS: Record<string, string[]> = {
  "Full Stack SDE":        ["HTML & CSS","JavaScript","TypeScript","React","Next.js","Node.js","Express.js","MongoDB","REST APIs","Git & GitHub"],
  "Frontend Developer":    ["HTML & CSS","JavaScript","TypeScript","React","Next.js","Tailwind CSS","Git & GitHub","Figma Basics"],
  "Backend Developer":     ["JavaScript","TypeScript","Node.js","Express.js","PostgreSQL","MongoDB","Docker","Git & GitHub"],
  "AI Engineer":           ["Python","NumPy & Pandas","Machine Learning Basics","Deep Learning (PyTorch)","NLP Fundamentals","Git & GitHub"],
  "Data Scientist":        ["Python","Statistics & Probability","NumPy & Pandas","SQL","Machine Learning","Data Visualization"],
  "DevOps Engineer":       ["Linux Fundamentals","Bash Scripting","Docker","Git & GitHub","Networking Basics","Cloud Basics (AWS/GCP)"],
  "Cloud Engineer":        ["Linux Fundamentals","Networking Basics","AWS Core Services (EC2/S3)","Docker","Git & GitHub"],
  "Cybersecurity Analyst": ["Networking Fundamentals","Linux Basics","Python Scripting","Web Application Security","Git & GitHub"],
  "Mobile App Developer":  ["JavaScript","TypeScript","React Native","Expo Framework","Git & GitHub"],
};

export interface GithubProfile {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string;
}

export interface GithubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  url: string;
  updated: string;
}

export interface GithubContribution {
  date: string;
  count: number;
}

export interface GithubData {
  profile: GithubProfile;
  repos: GithubRepo[];
  contributions: GithubContribution[];
  totalContributions: number;
  languages: string[];
}
