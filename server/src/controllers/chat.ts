import { Response } from "express";
import User from "../models/User";
import Roadmap from "../models/Roadmap";
import { AuthRequest } from "../middleware/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const user = await User.findById(req.userId).select("-passwordHash");
    const roadmap = await Roadmap.findOne({ userId: req.userId });

    const completedSkills = roadmap?.skills.filter((s) => s.status === "completed").map((s) => s.skillName) || [];
    const missingSkills = roadmap?.skills.filter((s) => s.status === "missing").map((s) => s.skillName) || [];
    const inProgressSkills = roadmap?.skills.filter((s) => s.status === "inProgress").map((s) => s.skillName) || [];

    const systemPrompt = `You are SkillSync AI, a helpful tech career mentor assistant.
The user's name is ${user?.name || "there"}.
Their goal role is: ${user?.goalRole || "Full Stack SDE"}.
Their XP: ${user?.xp || 0}, Streak: ${user?.streak || 0} days.
Completed skills: ${completedSkills.join(", ") || "none yet"}.
In progress skills: ${inProgressSkills.join(", ") || "none"}.
Remaining skills: ${missingSkills.join(", ") || "none"}.
Give concise, practical, personalized advice. Use emojis sparingly. Keep responses under 200 words.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content || "Sorry, I could not generate a response.";
    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ message: "Error processing message" });
  }
};
