import mongoose, { Schema, Document } from "mongoose";

export type Sentiment = "POS" | "NEU" | "NEG";
export type FeedbackStatus = "NEW" | "REVIEWED" | "ACTIONED";

export interface IFeedback extends Document {
  workspaceId: mongoose.Types.ObjectId;
  content: string;
  channel: string;
  sourceRef?: string;
  customerLabel?: string;
  sentiment?: Sentiment;
  sentimentScore?: number;
  status: FeedbackStatus;
  themeIds: mongoose.Types.ObjectId[];
  embedding?: number[];
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  content: { type: String, required: true },
  channel: { type: String, required: true },
  sourceRef: { type: String },
  customerLabel: { type: String },
  sentiment: { type: String, enum: ["POS", "NEU", "NEG"] },
  sentimentScore: { type: Number, min: -1, max: 1 },
  status: { type: String, enum: ["NEW", "REVIEWED", "ACTIONED"], default: "NEW" },
  themeIds: [{ type: Schema.Types.ObjectId, ref: "Theme" }],
  embedding: [{ type: Number }],
  createdAt: { type: Date, default: Date.now },
});

// Text index for search (Section C4 — full-text search over feedback content)
feedbackSchema.index({ content: "text" });

export default mongoose.model<IFeedback>("Feedback", feedbackSchema);