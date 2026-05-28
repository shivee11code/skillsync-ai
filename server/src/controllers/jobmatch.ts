import { Response } from "express";
import Roadmap from "../models/Roadmap";
import { AuthRequest } from "../middleware/auth";

const extractSkillsFromJD = (jdText: string): string[] => {
  const skillKeywords = [
    "JavaScript","TypeScript","Python","Java","C++","C#","Go","Rust","Ruby","Swift","Kotlin","PHP","Scala",
    "React","Next.js","Vue","Angular","Svelte","Node.js","Express","Django","Flask","FastAPI","Spring","Laravel",
    "MongoDB","PostgreSQL","MySQL","Redis","Elasticsearch","Firebase","DynamoDB","SQLite","Cassandra",
    "Docker","Kubernetes","AWS","GCP","Azure","Terraform","CI/CD","GitHub Actions","Jenkins","Ansible",
    "Machine Learning","Deep Learning","NLP","TensorFlow","PyTorch","Scikit-learn","Pandas","NumPy",
    "REST API","GraphQL","WebSocket","gRPC","Microservices","System Design","Git","Linux","Bash",
    "HTML","CSS","Tailwind","Bootstrap","SCSS","Figma","TypeScript","Webpack","Vite",
    "Agile","Scrum","JIRA","Communication","Problem Solving","Teamwork","Leadership",
    "Data Structures","Algorithms","OOP","Design Patterns","Testing","TDD","Jest","Cypress",
    "LangChain","OpenAI","LLM","Vector Database","Prompt Engineering","RAG",
    "Tableau","Power BI","Spark","Hadoop","Kafka","Airflow","DBT",
  ];
  const found = new Set<string>();
  const lower = jdText.toLowerCase();
  skillKeywords.forEach(skill => {
    if (lower.includes(skill.toLowerCase())) found.add(skill);
  });
  return Array.from(found);
};

const extractRoleFromJD = (jdText: string): string => {
  const roles: Record<string, string[]> = {
    "Full Stack SDE": ["full stack","fullstack","full-stack","mern","mean","web developer"],
    "Frontend Developer": ["frontend","front-end","react developer","ui developer","angular developer"],
    "Backend Developer": ["backend","back-end","api developer","server side","node developer"],
    "AI Engineer": ["ai engineer","machine learning","ml engineer","deep learning","llm","gen ai","generative ai"],
    "Data Scientist": ["data scientist","data science","data analyst","analytics","business intelligence"],
    "DevOps Engineer": ["devops","sre","platform engineer","cloud engineer","infrastructure","kubernetes"],
    "Mobile Developer": ["mobile","android","ios","react native","flutter"],
  };
  const lower = jdText.toLowerCase();
  for (const [role, keywords] of Object.entries(roles)) {
    if (keywords.some(kw => lower.includes(kw))) return role;
  }
  return "Software Engineer";
};

export const analyzeJobMatch = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { jobDescription } = req.body;
    if (!jobDescription || jobDescription.trim().length < 50) {
      res.status(400).json({ message: "Please paste a complete job description (min 50 characters)" });
      return;
    }

    const roadmap = await Roadmap.findOne({ userId: req.userId });
    const userSkills = roadmap?.skills.filter(s => s.status === "completed").map(s => s.skillName) || [];
    const allUserSkills = roadmap?.skills.map(s => s.skillName) || [];

    const jdSkills = extractSkillsFromJD(jobDescription);
    const detectedRole = extractRoleFromJD(jobDescription);

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    const bonusSkills: string[] = [];

    jdSkills.forEach(jdSkill => {
      const isCompleted = userSkills.some(us =>
        us.toLowerCase().includes(jdSkill.toLowerCase()) ||
        jdSkill.toLowerCase().includes(us.toLowerCase())
      );
      const isInRoadmap = allUserSkills.some(us =>
        us.toLowerCase().includes(jdSkill.toLowerCase()) ||
        jdSkill.toLowerCase().includes(us.toLowerCase())
      );
      if (isCompleted) matchedSkills.push(jdSkill);
      else if (isInRoadmap) missingSkills.push(jdSkill);
      else bonusSkills.push(jdSkill);
    });

    const matchPercent = jdSkills.length > 0
      ? Math.round((matchedSkills.length / jdSkills.length) * 100)
      : 0;

    const readinessLevel =
      matchPercent >= 80 ? "🟢 Ready to Apply" :
      matchPercent >= 60 ? "🟡 Almost Ready" :
      matchPercent >= 40 ? "🟠 Needs Preparation" :
      "🔴 Significant Gap";

    const advice =
      matchPercent >= 80
        ? "You are a strong match for this role! Polish your resume and start applying. Focus on the bonus skills to stand out."
        : matchPercent >= 60
        ? "You match most requirements. Complete the missing skills on your roadmap to become fully ready within 4-6 weeks."
        : matchPercent >= 40
        ? "You have a good foundation. Prioritize the missing skills — aim for 2-3 months of focused learning before applying."
        : "This role requires significant preparation. Follow your SkillSync roadmap consistently and revisit this JD in 3-4 months.";

    const prioritySkills = missingSkills.slice(0, 5);

    res.status(200).json({
      detectedRole,
      matchPercent,
      readinessLevel,
      advice,
      matchedSkills,
      missingSkills,
      bonusSkills,
      prioritySkills,
      totalJDSkills: jdSkills.length,
      stats: {
        matched: matchedSkills.length,
        missing: missingSkills.length,
        bonus: bonusSkills.length,
      }
    });
  } catch (error) {
    console.error("Job match error:", error);
    res.status(500).json({ message: "Error analyzing job description" });
  }
};
