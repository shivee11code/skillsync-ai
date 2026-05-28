import { Response } from "express";
import User from "../models/User";
import Roadmap from "../models/Roadmap";
import { AuthRequest } from "../middleware/auth";

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find({}, "name email xp streak goalRole githubUsername createdAt").sort({ xp: -1 }).limit(20);

    const leaderboard = await Promise.all(
      users.map(async (u, index) => {
        const roadmap = await Roadmap.findOne({ userId: u._id });
        const completed = roadmap?.skills.filter(s => s.status === "completed").length || 0;
        const total = roadmap?.skills.length || 0;
        return {
          rank: index + 1,
          id: u._id,
          name: u.name,
          goalRole: u.goalRole || "Explorer",
          xp: u.xp,
          streak: u.streak,
          skillsCompleted: completed,
          totalSkills: total,
          percent: total > 0 ? Math.round((completed / total) * 100) : 0,
          githubUsername: u.githubUsername || "",
          isCurrentUser: u._id.toString() === req.userId,
        };
      })
    );

    const currentUser = leaderboard.find(u => u.isCurrentUser);
    const currentUserRank = currentUser?.rank || null;

    res.status(200).json({ leaderboard, currentUserRank, totalUsers: leaderboard.length });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Error fetching leaderboard" });
  }
};
