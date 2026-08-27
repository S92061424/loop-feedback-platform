import { Router } from "express";
import { askLoop } from "../controllers/askController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.post("/", askLoop);

export default router;