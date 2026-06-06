import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth";
import roadmapRoutes from "./routes/roadmap";
import chatRoutes from "./routes/chat";
import quizRoutes from "./routes/quiz";
import interviewRoutes from "./routes/interview";
import githubRoutes from "./routes/github";
import leaderboardRoutes from "./routes/leaderboard";
import analyticsRoutes from "./routes/analytics";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:3000",
  "http://localhost:3000",
  "https://skillsync-ai-client.vercel.app",
  "https://client-pied-ten-27.vercel.app",
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ status: "ok", message: "SkillSync AI Server" });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "SkillSync API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/analytics", analyticsRoutes);
import studyplanRoutes from "./routes/studyplan";
app.use("/api/studyplan", studyplanRoutes);

app.use((_req, res) => { res.status(404).json({ message: "Route not found" }); });

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};
start();
