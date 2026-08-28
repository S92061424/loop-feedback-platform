import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", getDashboardStats);

export default router;