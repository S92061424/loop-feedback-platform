import type { Response } from "express";
import Feedback from "../models/Feedback.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { parseFeedbackCsv } from "../services/csvService.js";
import { classifyFeedback } from "../services/aiService.js";

// CREATE — single feedback entry
export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { content, channel, sourceRef, customerLabel } = req.body;

    if (!content || !channel) {
      return res.status(400).json({ error: "Content and channel are required" });
    }

    const feedback = await Feedback.create({
      workspaceId: req.user!.workspaceId,
      content,
      channel,
      sourceRef,
      customerLabel,
      status: "NEW",
    });

    // Classify asynchronously, don't block the response
    classifyFeedback(content)
  .then(async (result) => {
    console.log("Classification succeeded for", feedback._id, result);
    feedback.sentiment = result.sentiment;
    feedback.sentimentScore = result.sentimentScore;
    await feedback.save();
    console.log("Feedback saved with sentiment:", feedback.sentiment);
  })
  .catch((err) => console.error("Classification failed for feedback", feedback._id, err));
  
    res.status(201).json(feedback);
  } catch (error) {
    console.error("Create feedback error:", error);
    res.status(500).json({ error: "Failed to create feedback" });
  }
};

// LIST — paginated, scoped to the caller's workspace only
export const listFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { workspaceId: req.user!.workspaceId };

    if (req.query.channel) filter.channel = req.query.channel;
    if (req.query.sentiment) filter.sentiment = req.query.sentiment;
    if (req.query.status) filter.status = req.query.status;

    const [items, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Feedback.countDocuments(filter),
    ]);

    res.json({
      items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("List feedback error:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
};

// BULK UPLOAD via CSV
export const bulkUploadFeedback = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No CSV file uploaded" });
    }

    const { valid, errors } = parseFeedbackCsv(req.file.buffer);

    const created = await Feedback.insertMany(
      valid.map((row) => ({
        workspaceId: req.user!.workspaceId,
        content: row.content,
        channel: row.channel,
        customerLabel: row.customer_label,
        status: "NEW",
      }))
    );

    // Classify each imported item in the background
    created.forEach((feedback) => {
      classifyFeedback(feedback.content)
        .then(async (result) => {
          feedback.sentiment = result.sentiment;
          feedback.sentimentScore = result.sentimentScore;
          await feedback.save();
        })
        .catch((err) => console.error("Classification failed for feedback", feedback._id, err));
    });

    res.status(201).json({
      importedCount: created.length,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ error: "Failed to process CSV upload" });
  }
};