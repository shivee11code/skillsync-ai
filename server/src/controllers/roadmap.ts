import { Response } from "express";
import Roadmap from "../models/Roadmap";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const SKILL_TREES: Record<string, Record<string, string[]>> = {
  "Full Stack SDE": {
    "HTML & CSS": [], "JavaScript": ["HTML & CSS"], "TypeScript": ["JavaScript"],
    "React": ["JavaScript"], "Next.js": ["React", "TypeScript"], "Node.js": ["JavaScript"],
    "Express.js": ["Node.js"], "MongoDB": ["Node.js"], "REST APIs": ["Express.js"],
    "Git & GitHub": [], "System Design Basics": ["REST APIs", "MongoDB"],
    "Authentication (JWT/OAuth)": ["REST APIs"], "Deployment (Vercel/Render)": ["Next.js", "Express.js"],
  },
  "Frontend Developer": {
    "HTML & CSS": [], "JavaScript": ["HTML & CSS"], "TypeScript": ["JavaScript"],
    "React": ["JavaScript"], "Next.js": ["React"], "Tailwind CSS": ["HTML & CSS"],
    "State Management (Redux/Zustand)": ["React"], "REST API Integration": ["JavaScript"],
    "Testing (Jest/RTL)": ["React"], "Web Performance": ["React", "Next.js"],
    "Accessibility (a11y)": ["HTML & CSS"], "Git & GitHub": [], "Figma Basics": [],
  },
  "Backend Developer": {
    "JavaScript": [], "TypeScript": ["JavaScript"], "Node.js": ["JavaScript"],
    "Express.js": ["Node.js"], "REST API Design": ["Express.js"],
    "PostgreSQL": [], "MongoDB": [], "Redis": ["Node.js"],
    "Authentication (JWT/OAuth)": ["REST API Design"],
    "GraphQL": ["REST API Design"], "Docker": ["Node.js"],
    "System Design": ["REST API Design", "PostgreSQL"], "Git & GitHub": [],
  },
  "AI Engineer": {
    "Python": [], "NumPy & Pandas": ["Python"], "Data Visualization": ["NumPy & Pandas"],
    "Machine Learning Basics": ["NumPy & Pandas"], "Scikit-learn": ["Machine Learning Basics"],
    "Deep Learning (PyTorch)": ["Machine Learning Basics"], "NLP Fundamentals": ["Deep Learning (PyTorch)"],
    "LLM & Prompt Engineering": ["NLP Fundamentals"], "LangChain": ["LLM & Prompt Engineering"],
    "Vector Databases": ["LLM & Prompt Engineering"], "MLOps Basics": ["Scikit-learn"], "Git & GitHub": [],
  },
  "Data Scientist": {
    "Python": [], "Statistics & Probability": [], "NumPy & Pandas": ["Python"],
    "Data Cleaning": ["NumPy & Pandas"], "Exploratory Data Analysis": ["Data Cleaning", "Statistics & Probability"],
    "Data Visualization": ["Exploratory Data Analysis"], "SQL": [],
    "Machine Learning": ["Statistics & Probability", "NumPy & Pandas"],
    "Feature Engineering": ["Machine Learning"], "Model Evaluation": ["Machine Learning"],
    "Storytelling with Data": ["Data Visualization"],
  },
  "DevOps Engineer": {
    "Linux Fundamentals": [], "Bash Scripting": ["Linux Fundamentals"], "Networking Basics": [],
    "Git & GitHub": [], "Docker": ["Linux Fundamentals"], "Kubernetes": ["Docker"],
    "CI/CD (GitHub Actions)": ["Git & GitHub", "Docker"], "Cloud Basics (AWS/GCP)": ["Networking Basics"],
    "Terraform (IaC)": ["Cloud Basics (AWS/GCP)"], "Monitoring (Grafana)": ["Docker"],
  },
  "Cloud Engineer": {
    "Linux Fundamentals": [], "Networking Basics": [], "Git & GitHub": [],
    "AWS Core Services (EC2/S3)": ["Networking Basics"], "Azure Fundamentals": ["Networking Basics"],
    "IAM & Security": ["AWS Core Services (EC2/S3)"], "VPC & Networking": ["AWS Core Services (EC2/S3)"],
    "Docker": ["Linux Fundamentals"], "Kubernetes": ["Docker"],
    "Terraform": ["AWS Core Services (EC2/S3)"], "CI/CD Pipelines": ["Git & GitHub", "Docker"],
    "Monitoring (CloudWatch)": ["AWS Core Services (EC2/S3)"], "Serverless (Lambda)": ["AWS Core Services (EC2/S3)"],
  },
  "Cybersecurity Analyst": {
    "Networking Fundamentals": [], "Linux Basics": [], "Python Scripting": [],
    "Operating System Security": ["Linux Basics"], "Cryptography Basics": ["Networking Fundamentals"],
    "Web Application Security": ["Networking Fundamentals"], "Ethical Hacking Basics": ["Operating System Security"],
    "Penetration Testing": ["Ethical Hacking Basics"], "OWASP Top 10": ["Web Application Security"],
    "Vulnerability Assessment": ["Penetration Testing"], "SIEM Tools (Splunk)": ["Networking Fundamentals"],
    "Incident Response": ["SIEM Tools (Splunk)"], "Malware Analysis": ["Operating System Security"],
    "Compliance & Frameworks (ISO/NIST)": ["Incident Response"],
  },
  "Mobile App Developer": {
    "JavaScript": [], "TypeScript": ["JavaScript"], "React Native": ["JavaScript"],
    "Expo Framework": ["React Native"], "Mobile UI/UX Basics": [],
    "State Management (Redux)": ["React Native"], "REST API Integration": ["React Native"],
    "AsyncStorage": ["React Native"], "Push Notifications": ["Expo Framework"],
    "App Store Deployment": ["Expo Framework"], "Git & GitHub": [],
    "Performance Optimization": ["React Native", "State Management (Redux)"],
  },
};

const PROJECTS: Record<string, Array<{ title: string; difficulty: string; techStack: string[]; description: string }>> = {
  "Full Stack SDE": [
    { title: "Personal Portfolio", difficulty: "Beginner", techStack: ["HTML", "CSS", "JavaScript"], description: "Build a responsive portfolio website to showcase your projects." },
    { title: "Todo App with Auth", difficulty: "Intermediate", techStack: ["React", "Node.js", "MongoDB"], description: "Full stack todo app with user login and JWT authentication." },
    { title: "E-Commerce Platform", difficulty: "Advanced", techStack: ["Next.js", "Express.js", "MongoDB", "Stripe"], description: "Complete e-commerce site with cart, payments, and admin panel." },
  ],
  "Frontend Developer": [
    { title: "Landing Page Clone", difficulty: "Beginner", techStack: ["HTML", "CSS", "JavaScript"], description: "Clone a popular website landing page with pixel-perfect accuracy." },
    { title: "Dashboard UI", difficulty: "Intermediate", techStack: ["React", "Tailwind CSS", "Recharts"], description: "Interactive admin dashboard with charts, tables, and filters." },
    { title: "Design System", difficulty: "Advanced", techStack: ["React", "TypeScript", "Storybook"], description: "Build a reusable component library with documentation." },
  ],
  "Backend Developer": [
    { title: "REST API", difficulty: "Beginner", techStack: ["Node.js", "Express.js", "MongoDB"], description: "Build a CRUD REST API for a blog with proper error handling." },
    { title: "Authentication Service", difficulty: "Intermediate", techStack: ["Node.js", "JWT", "PostgreSQL"], description: "Microservice handling login, registration, and OAuth." },
    { title: "Real-time Chat API", difficulty: "Advanced", techStack: ["Node.js", "Socket.io", "Redis"], description: "Scalable chat backend with rooms, presence, and message history." },
  ],
  "AI Engineer": [
    { title: "Text Classifier", difficulty: "Beginner", techStack: ["Python", "Scikit-learn", "Pandas"], description: "Build a sentiment analysis model on movie reviews." },
    { title: "Chatbot with LangChain", difficulty: "Intermediate", techStack: ["Python", "LangChain", "OpenAI"], description: "Document Q&A chatbot using RAG and vector databases." },
    { title: "AI Resume Builder", difficulty: "Advanced", techStack: ["Next.js", "Python", "OpenAI", "FastAPI"], description: "Generate tailored resumes using LLMs and user profile data." },
  ],
  "Data Scientist": [
    { title: "EDA Project", difficulty: "Beginner", techStack: ["Python", "Pandas", "Matplotlib"], description: "Exploratory data analysis on a public dataset with visualizations." },
    { title: "ML Price Predictor", difficulty: "Intermediate", techStack: ["Python", "Scikit-learn", "Streamlit"], description: "Predict house prices using regression models with a web UI." },
    { title: "Customer Churn Model", difficulty: "Advanced", techStack: ["Python", "XGBoost", "MLflow"], description: "End-to-end ML pipeline with feature engineering and model tracking." },
  ],
  "DevOps Engineer": [
    { title: "Dockerize an App", difficulty: "Beginner", techStack: ["Docker", "Node.js"], description: "Containerize a Node.js application with Docker and docker-compose." },
    { title: "CI/CD Pipeline", difficulty: "Intermediate", techStack: ["GitHub Actions", "Docker", "AWS"], description: "Automated build, test, and deploy pipeline for a web app." },
    { title: "Kubernetes Cluster", difficulty: "Advanced", techStack: ["Kubernetes", "Helm", "Terraform"], description: "Deploy a microservices app on Kubernetes with auto-scaling." },
  ],
  "Cloud Engineer": [
    { title: "Static Website on S3", difficulty: "Beginner", techStack: ["AWS S3", "CloudFront"], description: "Host and serve a static website using AWS S3 and CloudFront CDN." },
    { title: "Serverless API", difficulty: "Intermediate", techStack: ["AWS Lambda", "API Gateway", "DynamoDB"], description: "Build a serverless REST API using AWS Lambda and API Gateway." },
    { title: "Multi-Region Architecture", difficulty: "Advanced", techStack: ["AWS", "Terraform", "Route53"], description: "Design a highly available multi-region cloud infrastructure." },
  ],
  "Cybersecurity Analyst": [
    { title: "Network Scanner", difficulty: "Beginner", techStack: ["Python", "Nmap"], description: "Build a basic network scanner to discover open ports and services." },
    { title: "Web Vulnerability Scanner", difficulty: "Intermediate", techStack: ["Python", "OWASP ZAP"], description: "Automated scanner to detect common web vulnerabilities." },
    { title: "SIEM Dashboard", difficulty: "Advanced", techStack: ["Splunk", "Python", "ELK Stack"], description: "Security information and event management system with alerts." },
  ],
  "Mobile App Developer": [
    { title: "To-Do Mobile App", difficulty: "Beginner", techStack: ["React Native", "Expo"], description: "Simple cross-platform todo app with local storage." },
    { title: "Weather App", difficulty: "Intermediate", techStack: ["React Native", "Expo", "REST API"], description: "Real-time weather app with location detection and forecasts." },
    { title: "E-Commerce Mobile App", difficulty: "Advanced", techStack: ["React Native", "Redux", "Stripe"], description: "Full-featured shopping app with cart, payments, and push notifications." },
  ],
};

const RESOURCES: Record<string, string[]> = {
  "HTML & CSS": ["MDN Web Docs", "freeCodeCamp HTML/CSS", "The Odin Project"],
  "JavaScript": ["javascript.info", "Eloquent JavaScript", "freeCodeCamp JS"],
  "TypeScript": ["typescriptlang.org docs", "Total TypeScript by Matt Pocock"],
  "React": ["react.dev official docs", "Scrimba React Course"],
  "Next.js": ["nextjs.org/learn", "Lee Robinson YouTube"],
  "Node.js": ["nodejs.org docs", "The Odin Project Node"],
  "Python": ["python.org tutorial", "Automate the Boring Stuff", "CS50P"],
  "Docker": ["docs.docker.com", "TechWorld with Nana YouTube"],
  "Git & GitHub": ["git-scm.com", "GitHub Skills", "Atlassian Git Tutorial"],
  "MongoDB": ["MongoDB University", "Mongoose docs"],
  "PostgreSQL": ["postgresql.org tutorial", "PostgreSQL Exercises"],
  "Machine Learning Basics": ["fast.ai", "Andrew Ng ML Course", "Kaggle Learn"],
  "Linux Fundamentals": ["linuxcommand.org", "OverTheWire Bandit wargame"],
  "Networking Fundamentals": ["Professor Messer CompTIA N+", "Cisco Networking Academy"],
  "AWS Core Services (EC2/S3)": ["AWS Skill Builder", "Cloud Quest by AWS", "freeCodeCamp AWS"],
};

export const generateRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalRole, currentSkills } = req.body;
    if (!goalRole) { res.status(400).json({ message: "Goal role is required" }); return; }

    const skillTree = SKILL_TREES[goalRole] || {};
    const requiredSkills = Object.keys(skillTree);
    const normalizedCurrent = (currentSkills as string[]).map((s: string) => s.toLowerCase().trim());

    const skillNodes = requiredSkills.map((skill) => ({
      skillName: skill,
      status: normalizedCurrent.some((s) =>
        s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s)
      ) ? "completed" : "missing",
      proficiencyLevel: "beginner",
      resources: RESOURCES[skill] || [],
      estimatedWeeks: 1,
    }));

    const projects = PROJECTS[goalRole] || [
      { title: "Portfolio Website", difficulty: "Beginner", techStack: ["HTML", "CSS", "JavaScript"], description: "Build a personal portfolio to showcase your work." },
      { title: "Full Stack App", difficulty: "Intermediate", techStack: ["React", "Node.js", "MongoDB"], description: "Build a complete web application with frontend and backend." },
      { title: "Production App", difficulty: "Advanced", techStack: ["Next.js", "Docker", "AWS"], description: "Deploy a production-ready application with CI/CD pipeline." },
    ];

    const missingSkills = skillNodes.filter((s) => s.status === "missing").map((s) => s.skillName);
    const weeklyPlan = `Focus on ${missingSkills.slice(0, 3).join(", ")} first. Spend 2-3 hours daily and complete one skill per week. Build the beginner project after finishing the first 3 skills.`;

    const existing = await Roadmap.findOne({ userId: req.userId });
    const roadmapData = {
      userId: req.userId,
      goalRole,
      skills: skillNodes,
      projects,
      totalXp: 0,
    };

    const roadmap = existing
      ? await Roadmap.findByIdAndUpdate(existing._id, roadmapData, { new: true })
      : await Roadmap.create(roadmapData);

    await User.findByIdAndUpdate(req.userId, { goalRole, currentSkills });

    res.status(200).json({ roadmap, weeklyPlan, missingSkills });
  } catch (error) {
    console.error("Generate roadmap error:", error);
    res.status(500).json({ message: "Error generating roadmap" });
  }
};

export const getRoadmap = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.userId });
    if (!roadmap) { res.status(404).json({ message: "No roadmap found. Generate one first." }); return; }
    res.status(200).json({ roadmap });
  } catch (error) {
    console.error("Get roadmap error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateSkillStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { skillName } = req.params;
    const { status } = req.body;
    const roadmap = await Roadmap.findOne({ userId: req.userId });
    if (!roadmap) { res.status(404).json({ message: "Roadmap not found" }); return; }
    const skill = roadmap.skills.find((s) => s.skillName === skillName);
    if (!skill) { res.status(404).json({ message: "Skill not found" }); return; }
    const prev = skill.status;
    skill.status = status;
    if (status === "completed" && prev !== "completed") {
      roadmap.totalXp += 10;
      await User.findByIdAndUpdate(req.userId, { $inc: { xp: 10 } });
    } else if (prev === "completed" && status !== "completed") {
      roadmap.totalXp = Math.max(0, roadmap.totalXp - 10);
      await User.findByIdAndUpdate(req.userId, { $inc: { xp: -10 } });
    }
    await roadmap.save();
    res.status(200).json({ roadmap });
  } catch (error) {
    console.error("Update skill error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
