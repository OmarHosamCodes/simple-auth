import { Router } from "express";
import { login, profile, register } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", requireAuth, profile);

export default router;
