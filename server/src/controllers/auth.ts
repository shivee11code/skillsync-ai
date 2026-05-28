import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

const generateToken = (userId: string): string =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string, { expiresIn: "7d" });

const userPayload = (user: any) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  goalRole: user.goalRole,
  currentSkills: user.currentSkills,
  xp: user.xp,
  streak: user.streak,
  githubUsername: user.githubUsername || "",
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) { res.status(400).json({ message: "All fields are required" }); return; }
    if (password.length < 6) { res.status(400).json({ message: "Password must be at least 6 characters" }); return; }
    const existing = await User.findOne({ email });
    if (existing) { res.status(409).json({ message: "Email already registered" }); return; }
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    res.status(201).json({ token: generateToken(user._id.toString()), user: userPayload(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) { res.status(400).json({ message: "Email and password are required" }); return; }
    const user = await User.findOne({ email });
    if (!user) { res.status(401).json({ message: "Invalid credentials" }); return; }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) { res.status(401).json({ message: "Invalid credentials" }); return; }
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - new Date(user.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) user.streak += 1;
    else if (diffDays > 1) user.streak = 1;
    user.lastActiveDate = today;
    await user.save();
    res.status(200).json({ token: generateToken(user._id.toString()), user: userPayload(user) });
  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { goalRole, currentSkills, githubUsername } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { goalRole, currentSkills, githubUsername },
      { new: true, select: "-passwordHash" }
    );
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
