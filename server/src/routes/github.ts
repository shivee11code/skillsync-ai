import { Router } from "express";
import { getGithubStats } from "../controllers/github";
import authMiddleware from "../middleware/auth";
const router = Router();
router.get("/:username", authMiddleware, getGithubStats);
export default router;
