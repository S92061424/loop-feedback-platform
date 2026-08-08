import mongoose, { Schema, Document } from "mongoose";

export interface IWorkspace extends Document {
  name: string;
  createdAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IWorkspace>("Workspace", workspaceSchema);