import { Router } from "express";
import { listThemes, getThemeFeedback, getThemeTrends } from "../controllers/themeController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);

router.get("/", listThemes);
router.get("/trends", getThemeTrends);
router.get("/:themeId/feedback", getThemeFeedback);

export default router;