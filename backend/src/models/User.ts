import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "ADMIN" | "ANALYST" | "VIEWER";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  workspaceId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "ANALYST", "VIEWER"], required: true },
  workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", userSchema);