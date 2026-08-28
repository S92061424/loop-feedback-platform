import type { Response } from "express";
import Feedback from "../models/Feedback.js";
import Theme from "../models/Theme.js";
import Report from "../models/Report.js";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import { generateReportNarrative } from "../services/aiService.js";

// Generate a new VoC report for a period
export const generateReport = async (req: AuthRequest, res: Response) => {
  try {
    const { periodDays = 7 } = req.body;
    const periodEnd = new Date();
    const periodStart = new Date(periodEnd.getTime() - periodDays * 24 * 60 * 60 * 1000);

    const filter = {
      workspaceId: req.user!.workspaceId,
      createdAt: { $gte: periodStart, $lte: periodEnd },
    };

    const totalFeedback = await Feedback.countDocuments(filter);
    const posCount = await Feedback.countDocuments({ ...filter, sentiment: "POS" });
    const neuCount = await Feedback.countDocuments({ ...filter, sentiment: "NEU" });
    const negCount = await Feedback.countDocuments({ ...filter, sentiment: "NEG" });

    const themes = await Theme.find({ workspaceId: req.user!.workspaceId });
    const themeCounts = await Promise.all(
      themes.map(async (theme) => ({
        name: theme.name,
        count: await Feedback.countDocuments({ ...filter, themeIds: theme._id }),
      }))
    );
    const topThemes = themeCounts.filter((t) => t.count > 0).sort((a, b) => b.count - a.count).slice(0, 5);

    const sampleFeedback = await Feedback.find(filter).sort({ createdAt: -1 }).limit(3);
    const sampleQuotes = sampleFeedback.map((f) => f.content);

    const stats = {
      totalFeedback,
      sentimentBreakdown: { POS: posCount, NEU: neuCount, NEG: negCount },
      topThemes,
      sampleQuotes,
    };

    const narrative = await generateReportNarrative(stats);

    const report = await Report.create({
      workspaceId: req.user!.workspaceId,
      title: `Voice of Customer Report — ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
      periodStart,
      periodEnd,
      contentJson: { stats, narrative },
      generatedBy: req.user!.userId,
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Generate report error:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
};

// List saved reports
export const listReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await Report.find({ workspaceId: req.user!.workspaceId }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    console.error("List reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// Get a single report
export const getReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await Report.findOne({ _id: req.params.reportId as string, workspaceId: req.user!.workspaceId });
    if (!report) return res.status(404).json({ error: "Report not found" });
    res.json(report);
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
};