import type { Response } from "express";
import Feedback from "../models/Feedback.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { embedText, cosineSimilarity, answerQuestion } from "../services/aiService.js";

export const askLoop = async (req: AuthRequest, res: Response) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Question is required" });
    }

    const allFeedback = await Feedback.find({
      workspaceId: req.user!.workspaceId,
      embedding: { $exists: true, $ne: [] },
    });

    if (allFeedback.length === 0) {
      return res.json({
        answer: "There isn't enough feedback data yet to answer this question.",
        sources: [],
      });
    }

    const questionEmbedding = await embedText(question);

    const ranked = allFeedback
      .map((item) => ({
        item,
        score: cosineSimilarity(questionEmbedding, item.embedding as number[]),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const topItems = ranked.map((r) => r.item);

    const answer = await answerQuestion(
      question,
      topItems.map((i) => ({
        content: i.content,
        sentiment: (i.sentiment as string) || undefined,
        channel: i.channel,
      }))
    );

    res.json({
      answer,
      sources: topItems.map((i) => ({
        id: i._id,
        content: i.content,
        channel: i.channel,
        sentiment: i.sentiment,
      })),
    });
  } catch (error) {
    console.error("Ask LOOP error:", error);
    res.status(500).json({ error: "Failed to answer question" });
  }
};