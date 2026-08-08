import mongoose, { Schema, Document } from "mongoose";

export interface ITheme extends Document {
  name: string;
  description?: string;
  color?: string;
  workspaceId: mongoose.Types.ObjectId;
}

const themeSchema = new Schema<ITheme>({
  name: { type: String, required: true },
  description: { type: String },
  color: { type: String },
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
});

export default mongoose.model<ITheme>("Theme", themeSchema);