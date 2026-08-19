import { Router } from "express";
import multer from "multer";
import { createFeedback, listFeedback, bulkUploadFeedback } from "../controllers/feedbackController.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(requireAuth);

router.post("/", createFeedback);
router.get("/", listFeedback);
router.post("/bulk-upload", upload.single("file"), bulkUploadFeedback);

export default router;