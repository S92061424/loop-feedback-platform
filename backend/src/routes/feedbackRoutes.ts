import { Router } from "express";
import { createFeedback, listFeedback } from "../controllers/feedbackController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth); // every route below requires a valid token

router.post("/", createFeedback);
router.get("/", listFeedback);

export default router;