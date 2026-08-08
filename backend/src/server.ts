import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Workspace from "./models/Workspace.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("LOOP backend is running!");
});

// TEMPORARY TEST — we'll remove this after confirming it works
async function testWorkspace() {
  const existing = await Workspace.findOne({ name: "Demo Workspace" });
  if (!existing) {
    const workspace = await Workspace.create({ name: "Demo Workspace" });
    console.log("Created test workspace:", workspace);
  } else {
    console.log("Test workspace already exists:", existing);
  }
}

// Start everything in the right order
async function startServer() {
  await connectDB();       // wait for MongoDB to connect first
  await testWorkspace();   // then run the test
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();