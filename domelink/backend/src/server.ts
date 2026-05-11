import app from "./app.js"; 
import http from "http";
import { env } from "./config/env.js";
import { initSocket } from "./socket.js";

const server = http.createServer(app);
initSocket(server);

// THE FIX: Explicitly bind to 0.0.0.0 so Docker can route external traffic
server.listen(Number(env.PORT), "0.0.0.0", () => {
  console.log(`Server running on port ${env.PORT} and bound to 0.0.0.0`);
});