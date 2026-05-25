import app from "./app.js";
import http from "http";
import { env, validateEnv } from "./config/env.js";
import { initSocket } from "./socket.js";
import { logger } from "./utils/logger.js";

// Validate environment before starting
validateEnv();

const server = http.createServer(app);
initSocket(server);

server.listen(Number(env.PORT), "0.0.0.0", () => {
  logger.info("Server started", {
    port: env.PORT,
    env: env.NODE_ENV,
    pid: process.pid,
  });
});

// Graceful shutdown
const shutdown = (signal: string) => {
  logger.info("Graceful shutdown initiated", { signal });
  server.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  // Force exit after 10s
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught exception", { error: err.message, stack: err.stack });
  process.exit(1);
});
