import { Router } from "express";
import { generateReport, listReports, getReport } from "../controllers/reportController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);

router.post("/generate", generateReport);
router.get("/", listReports);
router.get("/:reportId", getReport);

export default router;