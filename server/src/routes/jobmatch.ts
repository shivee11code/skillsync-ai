import { Router } from "express";
import { analyzeJobMatch } from "../controllers/jobmatch";
import authMiddleware from "../middleware/auth";
const router = Router();
router.post("/analyze", authMiddleware, analyzeJobMatch);
export default router;
