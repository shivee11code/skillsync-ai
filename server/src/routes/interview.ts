import { Router } from "express";
import { getInterviewQuestions, submitInterview } from "../controllers/interview";
import authMiddleware from "../middleware/auth";
const router = Router();
router.get("/:goalRole", authMiddleware, getInterviewQuestions);
router.post("/:goalRole/submit", authMiddleware, submitInterview);
export default router;
