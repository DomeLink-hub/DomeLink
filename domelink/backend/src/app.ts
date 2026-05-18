import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";

const app = express();

const corsOptions = {
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

// ✅ THIS IS THE FIX — explicitly handle preflight for all routes
app.options("*", cors(corsOptions));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", allowing: env.FRONTEND_URL });
});

app.use("/api", routes);

export default app;