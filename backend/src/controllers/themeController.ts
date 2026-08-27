import type { Response } from "express";
import mongoose from "mongoose";
import Theme from "../models/Theme.js";
import Feedback from "../models/Feedback.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

// List themes with feedback counts
export const listThemes = async (req: AuthRequest, res: Response) => {
  try {
    const themes = await Theme.find({ workspaceId: req.user!.workspaceId });

    const themesWithCounts = await Promise.all(
      themes.map(async (theme) => {
        const count = await Feedback.countDocuments({
          workspaceId: req.user!.workspaceId,
          themeIds: theme._id,
        });
        return { ...theme.toObject(), count };
      })
    );

    res.json(themesWithCounts);
  } catch (error) {
    console.error("List themes error:", error);
    res.status(500).json({ error: "Failed to fetch themes" });
  }
};

// Get feedback for a specific theme (drill-down)
export const getThemeFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const items = await Feedback.find({
      workspaceId: req.user!.workspaceId,
     themeIds: { $in: [new mongoose.Types.ObjectId(req.params.themeId as string)] },
    }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("Get theme feedback error:", error);
    res.status(500).json({ error: "Failed to fetch theme feedback" });
  }
};

// Trends: theme volume this period vs previous period
export const getThemeTrends = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // last 7 days
    const prevPeriodStart = new Date(periodStart.getTime() - 7 * 24 * 60 * 60 * 1000);

    const themes = await Theme.find({ workspaceId: req.user!.workspaceId });

    const trends = await Promise.all(
      themes.map(async (theme) => {
        const currentCount = await Feedback.countDocuments({
          workspaceId: req.user!.workspaceId,
          themeIds: theme._id,
          createdAt: { $gte: periodStart },
        });
        const previousCount = await Feedback.countDocuments({
          workspaceId: req.user!.workspaceId,
          themeIds: theme._id,
          createdAt: { $gte: prevPeriodStart, $lt: periodStart },
        });

        const change = previousCount === 0 ? (currentCount > 0 ? 100 : 0) : Math.round(((currentCount - previousCount) / previousCount) * 100);

        return {
          themeId: theme._id,
          name: theme.name,
          currentCount,
          previousCount,
          percentChange: change,
          isSpike: change >= 50,
        };
      })
    );

    res.json(trends);
  } catch (error) {
    console.error("Get theme trends error:", error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
};