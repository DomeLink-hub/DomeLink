import { Server as SocketIOServer } from "socket.io";
import type { Server } from "http";

let ioInstance: SocketIOServer | null = null;

export const getIO = () => ioInstance;

export const emitToUserRoom = (userId: string, event: string, payload: unknown) => {
  if (!ioInstance) return;
  ioInstance.to(`user:${userId}`).emit(event, payload);
};

export const initSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Adjust this in production
      methods: ["GET", "POST"]
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on("join_user", (userId: string) => {
      if (!userId) return;
      const room = `user:${userId}`;
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);
    });

    // Join a specific consultation chat room
    socket.on("join_chat", (consultationId: string) => {
      socket.join(consultationId);
      console.log(`Socket ${socket.id} joined room ${consultationId}`);
    });

    // Handle typing indicators
    socket.on("typing", ({ consultationId }) => {
      socket.to(consultationId).emit("typing");
    });

    socket.on("stop_typing", ({ consultationId }) => {
      socket.to(consultationId).emit("stop_typing");
    });

    // Handle sending messages (bypassing DB for instant UI reflection if needed)
    socket.on("send_message", (data) => {
      io.to(data.consultationId).emit("receive_message", data);
      io.to(data.consultationId).emit("new_message", data);
    });

    // Handle read receipts
    socket.on("read_message", ({ messageId, consultationId, userId }) => {
      io.to(consultationId).emit("message_read", { messageId, userId });
    });

    // Handle system activity messages
    socket.on("system_message", (data) => {
      io.to(data.consultationId).emit("receive_message", {
         ...data,
         isSystemMessage: true
      });
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
};