import { Router } from "express";
import { getQuiz, submitQuiz } from "../controllers/quiz";
import authMiddleware from "../middleware/auth";
const router = Router();
router.get("/:skillName", authMiddleware, getQuiz);
router.post("/:skillName/submit", authMiddleware, submitQuiz);
export default router;
