import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import Feedback from "../models/Feedback.js";
import { classifyFeedback, embedText } from "../services/aiService.js";

dotenv.config();

const sampleFeedback = [
  { content: "Onboarding took forever — I couldn't figure out how to invite my team.", channel: "support_ticket", customerLabel: "Acme Corp" },
  { content: "The new dashboard is gorgeous and finally fast. Huge improvement.", channel: "app_store_review", customerLabel: "Beta Inc" },
  { content: "It does the job, but the mobile experience needs work.", channel: "nps_survey", customerLabel: "Gamma LLC" },
  { content: "Prospect wants SSO before they'll sign — third time this month.", channel: "sales_call_note", customerLabel: "Delta Co" },
  { content: "Love the new export feature, saved me an hour today.", channel: "social_mention", customerLabel: "Epsilon Ltd" },
  { content: "Billing page keeps timing out when I try to download an invoice.", channel: "support_ticket", customerLabel: "Acme Corp" },
  { content: "Support team was incredibly responsive, fixed my issue in minutes.", channel: "nps_survey", customerLabel: "Zeta Inc" },
  { content: "The search feature is broken, returns no results for common terms.", channel: "support_ticket", customerLabel: "Beta Inc" },
  { content: "Really impressed with how easy it was to set up integrations.", channel: "app_store_review", customerLabel: "Gamma LLC" },
  { content: "We need better reporting — current charts don't show what we need.", channel: "sales_call_note", customerLabel: "Delta Co" },
  { content: "App crashes whenever I try to upload a large CSV file.", channel: "support_ticket", customerLabel: "Epsilon Ltd" },
  { content: "The onboarding checklist is a great touch, made setup painless.", channel: "nps_survey", customerLabel: "Zeta Inc" },
  { content: "Would love dark mode support, staring at white screens all day hurts.", channel: "social_mention", customerLabel: "Acme Corp" },
  { content: "Customer success rep didn't know the answer to a basic question.", channel: "support_ticket", customerLabel: "Beta Inc" },
  { content: "Pricing seems steep compared to competitors with similar features.", channel: "sales_call_note", customerLabel: "Gamma LLC" },
  { content: "The notification system is way too noisy, getting alert fatigue.", channel: "nps_survey", customerLabel: "Delta Co" },
  { content: "Finally a tool that actually understands what our team needs.", channel: "app_store_review", customerLabel: "Epsilon Ltd" },
  { content: "Team invite emails are going to spam, causing onboarding delays.", channel: "support_ticket", customerLabel: "Zeta Inc" },
  { content: "The API documentation is excellent, made integration straightforward.", channel: "social_mention", customerLabel: "Acme Corp" },
  { content: "Wish there was a way to bulk-edit statuses instead of one at a time.", channel: "nps_survey", customerLabel: "Beta Inc" },
];

async function seed() {
  const uri = process.env.MONGO_URI as string;
  await mongoose.connect(uri);
  console.log("Connected to MongoDB for seeding...");

  // Clear existing demo data (optional — comment out if you want to keep old data)
  const existingWorkspace = await Workspace.findOne({ name: "Demo Workspace" });
  if (existingWorkspace) {
    await User.deleteMany({ workspaceId: existingWorkspace._id });
    await Feedback.deleteMany({ workspaceId: existingWorkspace._id });
    await Workspace.deleteOne({ _id: existingWorkspace._id });
    console.log("Cleared old demo workspace data.");
  }

  // Create workspace
  const workspace = await Workspace.create({ name: "Demo Workspace" });
  console.log("Created workspace:", workspace._id);

  // Create 3 users, one per role
  const passwordHash = await bcrypt.hash("password123", 10);

  await User.create({
    name: "Admin User",
    email: "admin@demo.loop",
    passwordHash,
    role: "ADMIN",
    workspaceId: workspace._id,
  });

  await User.create({
    name: "Analyst User",
    email: "analyst@demo.loop",
    passwordHash,
    role: "ANALYST",
    workspaceId: workspace._id,
  });

  await User.create({
    name: "Viewer User",
    email: "viewer@demo.loop",
    passwordHash,
    role: "VIEWER",
    workspaceId: workspace._id,
  });

  console.log("Created 3 demo users (admin@demo.loop / analyst@demo.loop / viewer@demo.loop — password: password123)");

  // Create feedback items with AI classification + embeddings
  console.log(`Seeding ${sampleFeedback.length} feedback items with AI classification...`);
  for (const item of sampleFeedback) {
    const feedback = await Feedback.create({
      workspaceId: workspace._id,
      content: item.content,
      channel: item.channel,
      customerLabel: item.customerLabel,
      status: "NEW",
    });

    try {
      const result = await classifyFeedback(item.content);
      feedback.sentiment = result.sentiment;
      feedback.sentimentScore = result.sentimentScore;
      feedback.embedding = await embedText(item.content);
      await feedback.save();
      console.log(`Classified: "${item.content.slice(0, 40)}..." -> ${result.sentiment}`);
    } catch (err) {
      console.error(`Failed to classify item, saving without AI data:`, err);
    }

    // Small delay to avoid hitting API rate limits
    await new Promise((resolve) => setTimeout(resolve, 13000)); // 13s delay to stay under 5 req/min free tier limit
  }

  console.log("Seeding complete!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});