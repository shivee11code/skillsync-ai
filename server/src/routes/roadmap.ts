import { Router } from "express";
import { generateRoadmap, getRoadmap, updateSkillStatus } from "../controllers/roadmap";
import authMiddleware from "../middleware/auth";
const router = Router();
router.post("/generate", authMiddleware, generateRoadmap);
router.get("/", authMiddleware, getRoadmap);
router.put("/skill/:skillName", authMiddleware, updateSkillStatus);
export default router;
