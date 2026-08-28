import type { Response } from "express";
import mongoose from "mongoose";
import Feedback from "../models/Feedback.js";
import Theme from "../models/Theme.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const workspaceId = req.user!.workspaceId;

    const totalItems = await Feedback.countDocuments({ workspaceId });
    const posCount = await Feedback.countDocuments({ workspaceId, sentiment: "POS" });
    const neuCount = await Feedback.countDocuments({ workspaceId, sentiment: "NEU" });
    const negCount = await Feedback.countDocuments({ workspaceId, sentiment: "NEG" });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newThisWeek = await Feedback.countDocuments({ workspaceId, createdAt: { $gte: oneWeekAgo } });

    const volumeData = await Feedback.aggregate([
      { $match: { workspaceId: new mongoose.Types.ObjectId(workspaceId), createdAt: { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const themes = await Theme.find({ workspaceId });
    const themeCounts = await Promise.all(
      themes.map(async (theme) => ({
        name: theme.name,
        count: await Feedback.countDocuments({ workspaceId, themeIds: theme._id }),
      }))
    );
    const topThemes = themeCounts.filter((t) => t.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

    res.json({
      totalItems,
      newThisWeek,
      percentNegative: totalItems > 0 ? Math.round((negCount / totalItems) * 100) : 0,
      sentimentBreakdown: { POS: posCount, NEU: neuCount, NEG: negCount },
      volumeOverTime: volumeData.map((v) => ({ date: v._id, count: v.count })),
      topThemes,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};