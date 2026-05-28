import { Router } from "express";
import { generateStudyPlan } from "../controllers/studyplan";
import authMiddleware from "../middleware/auth";
const router = Router();
router.post("/generate", authMiddleware, generateStudyPlan);
export default router;
