import { Router } from "express";
import { chat } from "../controllers/chat";
import authMiddleware from "../middleware/auth";
const router = Router();
router.post("/", authMiddleware, chat);
export default router;
