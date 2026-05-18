import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { api, type Consultation } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";

interface ArchitectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultation: Consultation | null;
}

const ArchitectChatModal = ({ isOpen, onClose, consultation }: ArchitectChatModalProps) => {
  const queryClient = useQueryClient();
  const { user: architectUser } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const { data: persistedMessages = [] } = useQuery({
    queryKey: queryKeys.chat(consultation?._id || ""),
    queryFn: () => api.getChat(consultation?._id || ""),
    enabled: Boolean(consultation?._id) && isOpen,
  });

  useEffect(() => {
    if (persistedMessages.length > 0) setMessages(persistedMessages);
  }, [persistedMessages]);

  useEffect(() => {
    if (!isOpen || !consultation) return;

    const socketClient = io(import.meta.env.VITE_API_BASE_URL, { transports: ["websocket"] });

    socketClient.emit("join_chat", consultation._id);

    socketClient.on("receive_message", (message: any) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);
        return exists ? prev : [...prev, message];
      });
      setTimeout(() => endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
      setSocket(null);
    };
  }, [isOpen, consultation]);

  const handleSend = () => {
    if (!inputValue.trim() || !consultation) return;
    
    // Send via socket!
    socket?.emit("send_message", { 
      consultationId: consultation._id, 
      message: inputValue,
      userId: architectUser?.id
    });
    
    setInputValue("");
  };

  if (!consultation) return null;
  const clientName = consultation.userId.name;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed bottom-8 right-8 w-full max-w-lg h-[600px] bg-background z-50 flex flex-col overflow-hidden shadow-xl border border-border rounded-xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="text-body font-medium">Chat with {clientName}</h3>
                <p className="text-body-sm text-muted-foreground">{consultation.projectType} Project</p>
              </div>
              <button onClick={onClose}>✕</button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.sender?.id === architectUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-4 ${isMe ? "bg-foreground text-background" : "bg-secondary"}`}>
                      <p className="text-xs opacity-70 mb-1">{isMe ? "You" : clientName}</p>
                      <p className="text-body-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={endOfMessagesRef} />
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} placeholder={`Message ${clientName}...`} className="flex-1 px-4 py-3 bg-secondary rounded-md" />
              <button onClick={handleSend} className="px-6 py-3 bg-foreground text-background rounded-md">Send</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ArchitectChatModal;