import { Router } from "express";
import { getLeaderboard } from "../controllers/leaderboard";
import authMiddleware from "../middleware/auth";
const router = Router();
router.get("/", authMiddleware, getLeaderboard);
export default router;
