import { Server, type Socket } from "socket.io";
import type { Server as HttpServer } from "http";
import { env } from "./config/env.js";

export let io: Server | null = null;
const roomUsers = new Map<string, Set<string>>();

interface TypingPayload {
  consultationId: string;
  userId: string;
}

interface JoinPayload {
  consultationId: string;
  userId: string;
}

const emitPresence = (consultationId: string) => {
  if (!io) return;
  const users = Array.from(roomUsers.get(consultationId) || []);
  io.to(consultationId).emit("presence_update", { consultationId, users, count: users.length });
};

export const setupSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("join", (payload: JoinPayload | string) => {
      const consultationId = typeof payload === "string" ? payload : payload.consultationId;
      const userId = typeof payload === "string" ? socket.id : payload.userId;

      socket.join(consultationId);
      socket.data.userId = userId;

      if (!roomUsers.has(consultationId)) {
        roomUsers.set(consultationId, new Set<string>());
      }
      roomUsers.get(consultationId)?.add(userId);
      emitPresence(consultationId);
    });

    socket.on("typing", ({ consultationId, userId }: TypingPayload) => {
      socket.to(consultationId).emit("typing", { userId });
    });

    socket.on("stop_typing", ({ consultationId, userId }: TypingPayload) => {
      socket.to(consultationId).emit("stop_typing", { userId });
    });

    socket.on("disconnecting", () => {
      socket.rooms.forEach((room) => {
        if (room === socket.id) return;
        const users = roomUsers.get(room);
        const userId = String(socket.data.userId || socket.id);
        users?.delete(userId);
        if (users && users.size === 0) {
          roomUsers.delete(room);
        }
        emitPresence(room);
      });
    });
  });

  return io;
};
