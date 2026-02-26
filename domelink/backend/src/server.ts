import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { createServer } from "http";
import { setupSocket } from "./socket.js";

const start = async () => {
  await connectDatabase();
  const server = createServer(app);
  setupSocket(server);
  server.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
