import { Response } from "express";
import User from "../models/User";
import Roadmap from "../models/Roadmap";
import { AuthRequest } from "../middleware/auth";

export const getAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    const roadmap = await Roadmap.findOne({ userId: req.userId });

    if (!user || !roadmap) {
      res.status(404).json({ message: "Data not found" });
      return;
    }

    const skills = roadmap.skills;
    const completed = skills.filter(s => s.status === "completed");
    const inProgress = skills.filter(s => s.status === "inProgress");
    const missing = skills.filter(s => s.status === "missing");

    // Skill status breakdown
    const statusBreakdown = [
      { name: "Completed", value: completed.length, color: "#10b981" },
      { name: "In Progress", value: inProgress.length, color: "#f59e0b" },
      { name: "Not Started", value: missing.length, color: "#6b7280" },
    ];

    // XP milestones
    const xpMilestones = [
      { milestone: "0 XP", target: 0, achieved: user.xp >= 0 },
      { milestone: "50 XP", target: 50, achieved: user.xp >= 50 },
      { milestone: "100 XP", target: 100, achieved: user.xp >= 100 },
      { milestone: "150 XP", target: 150, achieved: user.xp >= 150 },
      { milestone: "200 XP", target: 200, achieved: user.xp >= 200 },
    ];

    // Simulated weekly XP progress (based on current XP)
    const weeklyProgress = Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - (6 - i));
      const dayName = day.toLocaleDateString("en-IN", { weekday: "short" });
      const baseXp = Math.max(0, user.xp - (6 - i) * Math.floor(user.xp / 10));
      return { day: dayName, xp: i === 6 ? user.xp : baseXp, skills: i === 6 ? completed.length : Math.max(0, completed.length - (6 - i)) };
    });

    // Skills by estimated weeks
    const skillsTimeline = skills.slice(0, 8).map(s => ({
      name: s.skillName.length > 12 ? s.skillName.substring(0, 12) + "..." : s.skillName,
      weeks: s.estimatedWeeks,
      status: s.status,
    }));

    // Completion rate
    const completionRate = skills.length > 0 ? Math.round((completed.length / skills.length) * 100) : 0;

    // Estimated weeks to finish
    const weeksLeft = missing.reduce((sum, s) => sum + (s.estimatedWeeks || 1), 0);

    res.status(200).json({
      overview: {
        totalSkills: skills.length,
        completed: completed.length,
        inProgress: inProgress.length,
        missing: missing.length,
        completionRate,
        xp: user.xp,
        streak: user.streak,
        weeksLeft,
        goalRole: user.goalRole,
      },
      statusBreakdown,
      weeklyProgress,
      skillsTimeline,
      xpMilestones,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};
