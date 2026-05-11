import express from "express";
import cors from "cors";
import { env } from "./config/env.js"; // Import the type-safe env object
import routes from "./routes/index.js";

const app = express();

app.use(cors({
  // Use the value exactly as it comes from env.ts
  origin: env.FRONTEND_URL, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  // This is a great way to debug: Check if the backend thinks it's configured right
  res.json({ 
    status: "ok", 
    allowing: env.FRONTEND_URL 
  });
});

app.use("/api", routes);

export default app;