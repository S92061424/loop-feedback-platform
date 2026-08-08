import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  periodStart: Date;
  periodEnd: Date;
  contentJson: Record<string, any>;
  generatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>({
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  title: { type: String, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  contentJson: { type: Schema.Types.Mixed, required: true },
  generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReport>("Report", reportSchema);