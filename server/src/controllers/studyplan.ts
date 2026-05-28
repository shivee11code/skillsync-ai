import { Response } from "express";
import Roadmap from "../models/Roadmap";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const SKILL_RESOURCES: Record<string, { resource: string; type: string; duration: string }[]> = {
  "HTML & CSS": [
    { resource: "MDN Web Docs — HTML Basics", type: "Documentation", duration: "2 hrs" },
    { resource: "CSS Flexbox Froggy — Interactive Game", type: "Practice", duration: "1 hr" },
    { resource: "Build a responsive landing page", type: "Project", duration: "3 hrs" },
  ],
  "JavaScript": [
    { resource: "javascript.info — The Modern JavaScript Tutorial", type: "Reading", duration: "3 hrs" },
    { resource: "30 Days of JavaScript — GitHub", type: "Practice", duration: "2 hrs" },
    { resource: "Build a todo app with vanilla JS", type: "Project", duration: "4 hrs" },
  ],
  "TypeScript": [
    { resource: "TypeScript Official Handbook", type: "Documentation", duration: "2 hrs" },
    { resource: "Total TypeScript — Matt Pocock", type: "Course", duration: "3 hrs" },
    { resource: "Convert a JS project to TypeScript", type: "Project", duration: "2 hrs" },
  ],
  "React": [
    { resource: "React Official Docs — react.dev", type: "Documentation", duration: "3 hrs" },
    { resource: "Scrimba React Course — Free", type: "Course", duration: "4 hrs" },
    { resource: "Build a weather app with React", type: "Project", duration: "4 hrs" },
  ],
  "Next.js": [
    { resource: "Next.js Official Tutorial — nextjs.org", type: "Tutorial", duration: "3 hrs" },
    { resource: "Lee Robinson Next.js Course — YouTube", type: "Video", duration: "2 hrs" },
    { resource: "Build a blog with Next.js and MDX", type: "Project", duration: "5 hrs" },
  ],
  "Node.js": [
    { resource: "Node.js Official Docs", type: "Documentation", duration: "2 hrs" },
    { resource: "The Odin Project — NodeJS Path", type: "Course", duration: "4 hrs" },
    { resource: "Build a REST API with Express", type: "Project", duration: "4 hrs" },
  ],
  "MongoDB": [
    { resource: "MongoDB University — M001 Free Course", type: "Course", duration: "3 hrs" },
    { resource: "Mongoose ODM Documentation", type: "Documentation", duration: "1 hr" },
    { resource: "Build a CRUD app with MongoDB", type: "Project", duration: "3 hrs" },
  ],
  "Python": [
    { resource: "Python.org Official Tutorial", type: "Documentation", duration: "2 hrs" },
    { resource: "Automate the Boring Stuff — Free Book", type: "Reading", duration: "3 hrs" },
    { resource: "Build a CLI tool in Python", type: "Project", duration: "3 hrs" },
  ],
  "Machine Learning Basics": [
    { resource: "Andrew Ng ML Course — Coursera", type: "Course", duration: "4 hrs" },
    { resource: "Kaggle ML Intro — Free", type: "Tutorial", duration: "2 hrs" },
    { resource: "Train a classification model", type: "Project", duration: "3 hrs" },
  ],
  "Docker": [
    { resource: "Docker Official Get Started Guide", type: "Tutorial", duration: "2 hrs" },
    { resource: "TechWorld with Nana Docker Course — YouTube", type: "Video", duration: "3 hrs" },
    { resource: "Dockerize a Node.js application", type: "Project", duration: "2 hrs" },
  ],
  "Git & GitHub": [
    { resource: "Git Official Documentation", type: "Documentation", duration: "1 hr" },
    { resource: "Oh My Git — Interactive Game", type: "Practice", duration: "1 hr" },
    { resource: "Contribute to an open source project", type: "Project", duration: "2 hrs" },
  ],
  "System Design Basics": [
    { resource: "System Design Primer — GitHub", type: "Reading", duration: "4 hrs" },
    { resource: "ByteByteGo — System Design YouTube", type: "Video", duration: "3 hrs" },
    { resource: "Design a URL shortener on paper", type: "Practice", duration: "2 hrs" },
  ],
};

const DEFAULT_RESOURCES = [
  { resource: "Official Documentation", type: "Documentation", duration: "2 hrs" },
  { resource: "YouTube Tutorial Series", type: "Video", duration: "3 hrs" },
  { resource: "Build a small practice project", type: "Project", duration: "3 hrs" },
];

const generateDayPlan = (
  skills: string[],
  durationDays: number,
  dailyHours: number
): Array<{
  day: number;
  date: string;
  skill: string;
  tasks: Array<{ time: string; task: string; type: string; duration: string }>;
  dayGoal: string;
}> => {
  const plan = [];
  const today = new Date();
  let skillIndex = 0;
  let dayWithinSkill = 0;
  const daysPerSkill = Math.max(1, Math.floor(durationDays / Math.max(skills.length, 1)));

  for (let day = 1; day <= durationDays; day++) {
    const date = new Date(today);
    date.setDate(today.getDate() + day - 1);
    const dateStr = date.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;

    if (skillIndex >= skills.length) skillIndex = skills.length - 1;
    const currentSkill = skills[skillIndex];
    const resources = SKILL_RESOURCES[currentSkill] || DEFAULT_RESOURCES;

    const tasks = [];
    let timeSlot = "9:00 AM";

    if (isWeekend) {
      tasks.push({ time: "10:00 AM", task: `Weekend Review: Revise ${currentSkill} concepts learned this week`, type: "Review", duration: "1 hr" });
      tasks.push({ time: "11:00 AM", task: `Practice: Solve 2-3 coding problems related to ${currentSkill}`, type: "Practice", duration: `${Math.max(1, dailyHours - 1)} hrs` });
    } else {
      if (dayWithinSkill === 0) {
        tasks.push({ time: "9:00 AM", task: `Introduction to ${currentSkill} — understand core concepts and use cases`, type: "Theory", duration: "1 hr" });
        tasks.push({ time: "10:00 AM", task: resources[0]?.resource || `Study ${currentSkill} fundamentals`, type: resources[0]?.type || "Study", duration: resources[0]?.duration || "2 hrs" });
        if (dailyHours >= 3) tasks.push({ time: "12:00 PM", task: `Code along: Write your first ${currentSkill} program`, type: "Coding", duration: "1 hr" });
      } else if (dayWithinSkill === 1) {
        tasks.push({ time: "9:00 AM", task: resources[1]?.resource || `Deep dive into ${currentSkill}`, type: resources[1]?.type || "Practice", duration: resources[1]?.duration || "2 hrs" });
        if (dailyHours >= 3) tasks.push({ time: "11:00 AM", task: `Build: ${resources[2]?.resource || `A small ${currentSkill} project`}`, type: "Project", duration: resources[2]?.duration || "3 hrs" });
      } else {
        tasks.push({ time: "9:00 AM", task: `${currentSkill} — Advanced concepts and edge cases`, type: "Theory", duration: "1 hr" });
        tasks.push({ time: "10:00 AM", task: resources[2]?.resource || `Complete ${currentSkill} project`, type: "Project", duration: "2 hrs" });
        if (dailyHours >= 3) tasks.push({ time: "12:00 PM", task: `Take the SkillSync Quiz for ${currentSkill} to verify your knowledge`, type: "Quiz", duration: "30 min" });
      }
    }

    const dayGoals: Record<number, string> = {
      0: `Understand ${currentSkill} fundamentals`,
      1: `Build something with ${currentSkill}`,
      2: `Master ${currentSkill} and pass the quiz`,
    };

    plan.push({
      day,
      date: dateStr,
      skill: currentSkill,
      tasks,
      dayGoal: isWeekend ? "Review & Practice Day 💪" : (dayGoals[dayWithinSkill % 3] || `Continue ${currentSkill}`),
    });

    dayWithinSkill++;
    if (dayWithinSkill >= daysPerSkill) {
      dayWithinSkill = 0;
      skillIndex++;
    }
  }

  return plan;
};

export const generateStudyPlan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { durationDays = 30, dailyHours = 2 } = req.body;

    const user = await User.findById(req.userId);
    const roadmap = await Roadmap.findOne({ userId: req.userId });

    if (!roadmap || !user) {
      res.status(404).json({ message: "Roadmap not found. Generate one first." });
      return;
    }

    const missingSkills = roadmap.skills
      .filter(s => s.status !== "completed")
      .map(s => s.skillName);

    if (missingSkills.length === 0) {
      res.status(200).json({
        message: "🎉 Congratulations! You have completed all skills in your roadmap!",
        plan: [],
        summary: { totalDays: 0, totalSkills: 0, skillsCovered: [], dailyHours, goalRole: user.goalRole },
      });
      return;
    }

    const skillsTocover = missingSkills.slice(0, Math.min(missingSkills.length, Math.floor(durationDays / 3)));
    const plan = generateDayPlan(skillsTocover, Number(durationDays), Number(dailyHours));

    const summary = {
      totalDays: durationDays,
      totalSkills: skillsTocover.length,
      skillsCovered: skillsTocover,
      dailyHours,
      goalRole: user.goalRole,
      totalHours: durationDays * dailyHours,
      completionDate: plan[plan.length - 1]?.date || "",
    };

    res.status(200).json({ plan, summary });
  } catch (error) {
    console.error("Study plan error:", error);
    res.status(500).json({ message: "Error generating study plan" });
  }
};
