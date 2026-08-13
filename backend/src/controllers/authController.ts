import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import Workspace from "../models/Workspace.js";
import User from "../models/User.js";
import { generateToken } from "../utils/jwt.js";

// SIGNUP: creates a new Workspace + the first User as ADMIN
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, workspaceName } = req.body;

    if (!name || !email || !password || !workspaceName) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const workspace = await Workspace.create({ name: workspaceName });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: "ADMIN",
      workspaceId: workspace._id,
    });

    const token = generateToken({
      userId: (user._id as any).toString(),
      workspaceId: (workspace._id as any).toString(),
      role: user.role,
    });

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      workspace: { id: workspace._id, name: workspace.name },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Something went wrong during signup" });
  }
};

// LOGIN: verifies credentials and returns a token
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken({
      userId: (user._id as any).toString(),
      workspaceId: user.workspaceId.toString(),
      role: user.role,
    });

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Something went wrong during login" });
  }
};