import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { api, type Architect, type ChatMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { useAuth } from "@/context/useAuthContext";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  architect: Architect;
  consultationId?: string | null;
}

type PaymentStatus = "idle" | "processing" | "success";

const ChatModal = ({ isOpen, onClose, architect, consultationId: initialConsultationId }: ChatModalProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAiBot = architect._id === "ai-bot";
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialConsultationId || isAiBot ? "success" : "idle");
  const [consultationId, setConsultationId] = useState<string | null>(initialConsultationId || null);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [presenceCount, setPresenceCount] = useState(1);

  const chatPrice = 49; // Price per chat session

  const { data: persistedMessages = [] } = useQuery({
    queryKey: queryKeys.chat(consultationId || ""),
    queryFn: () => api.getChat(consultationId || ""),
    enabled: Boolean(consultationId) && !isAiBot,
  });

  const markReadMutation = useMutation({
    mutationFn: () => api.markChatRead(consultationId || ""),
  });

  useEffect(() => {
    setConsultationId(initialConsultationId || (isAiBot ? "ai-session" : null));
    setPaymentStatus(initialConsultationId || isAiBot ? "success" : "idle");
  }, [initialConsultationId, isOpen, isAiBot]);

  useEffect(() => {
    if (!persistedMessages.length) return;
    setMessages(persistedMessages);
  }, [persistedMessages]);

  useEffect(() => {
    if (!isOpen || !consultationId || isAiBot) return;

    const socketClient = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
    });

    socketClient.emit("join", { consultationId, userId: user?.id || "viewer" });
    socketClient.on("message", (message: ChatMessage) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item._id === message._id);
        return exists ? prev : [...prev, message];
      });
      setTimeout(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    });
    socketClient.on("typing", () => setIsTyping(true));
    socketClient.on("stop_typing", () => setIsTyping(false));
    socketClient.on("presence_update", ({ count }: { count: number }) => {
      setPresenceCount(count);
    });
    socketClient.on("messages_read", ({ userId, messageIds }: { userId: string; messageIds: string[] }) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (!messageIds.includes(message._id)) return message;
          const alreadyRead = message.readBy.some((entry) => entry.userId === userId);
          if (alreadyRead) return message;
          return {
            ...message,
            readBy: [...message.readBy, { userId, readAt: new Date().toISOString() }],
          };
        }),
      );
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
      setSocket(null);
    };
  }, [isOpen, consultationId, user?.id, isAiBot]);

  useEffect(() => {
    if (!consultationId || !isOpen || paymentStatus !== "success" || isAiBot) return;
    if (messages.length === 0) return;
    const hasUnread = messages.some((message) => message.senderId._id !== user?.id && !message.readBy.some((entry) => entry.userId === user?.id));
    if (!hasUnread) return;
    markReadMutation.mutate();
  }, [consultationId, isOpen, messages, paymentStatus, user?.id, markReadMutation, isAiBot]);

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => api.sendChat(consultationId || "", message),
    onSuccess: () => {
      setIsTyping(false);
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat(consultationId || "") });
    },
    onError: () => {
      toast.error("Unable to send message.");
    },
  });

  const handlePayment = async () => {
    if (isAiBot) {
      setPaymentStatus("success");
      return;
    }
    setPaymentStatus("processing");

    try {
      const consultationIdToUse = consultationId
        ? consultationId
        : (await api.createConsultation({
            architectId: architect._id,
            message: "Hi, I would like to start a consultation.",
          }))._id;

      setConsultationId(consultationIdToUse);
      setPaymentStatus("success");
      await api.sendChat(
        consultationIdToUse,
        `Hello! I'm ${architect.name}. Thank you for reaching out. I'd love to hear about your project. What are you looking to create?`,
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat(consultationIdToUse) });
    } catch {
      setPaymentStatus("idle");
      toast.error("Unable to start consultation. Please try again.");
    }
  };

  const aiPrompt = useMemo(() => {
    const name = user?.name || "there";
    return [
      `Hi ${name}! I can help you scope your project, estimate budgets, and suggest architects.`,
      "Tell me your project type, location, and target budget to get instant recommendations.",
    ].join(" ");
  }, [user?.name]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || !consultationId) return;

    if (isAiBot) {
      const now = new Date().toISOString();
      const userId = user?.id || "guest";
      const userName = user?.name || "Guest";
      const userMessage: ChatMessage = {
        _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        consultationId,
        senderId: { _id: userId, name: userName, role: "homeowner" },
        message: inputValue,
        timestamp: now,
        readBy: [],
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);
      const nextResponse = buildAiResponse(inputValue);
      setTimeout(() => {
        const botMessage: ChatMessage = {
          _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          consultationId,
          senderId: { _id: architect._id, name: architect.name, role: "architect", avatar: architect.profileImage },
          message: nextResponse,
          timestamp: new Date().toISOString(),
          readBy: [],
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
        setTimeout(() => {
          endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 80);
      }, 700);
      return;
    }

    sendMessageMutation.mutate(inputValue);
    setInputValue("");
  };

  useEffect(() => {
    if (!isOpen || !isAiBot) return;
    if (messages.length > 0) return;
    const now = new Date().toISOString();
    const initialMessage: ChatMessage = {
      _id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      consultationId: "ai-session",
      senderId: { _id: architect._id, name: architect.name, role: "architect", avatar: architect.profileImage },
      message: aiPrompt,
      timestamp: now,
      readBy: [],
    };
    setMessages([initialMessage]);
  }, [aiPrompt, architect._id, architect.name, architect.profileImage, isAiBot, isOpen, messages.length]);

  const groupedMessages = messages.reduce<Array<{ date: string; items: Array<ChatMessage & { compact: boolean; readLabel?: string }> }>>((acc, message, index) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    const previous = messages[index - 1];
    const compact = Boolean(previous && previous.senderId._id === message.senderId._id);
    const readCountExcludingSender = message.readBy.filter((entry) => entry.userId !== message.senderId._id).length;
    const readLabel = readCountExcludingSender > 0 ? "Seen" : undefined;

    const lastGroup = acc[acc.length - 1];
    if (!lastGroup || lastGroup.date !== date) {
      acc.push({ date, items: [{ ...message, compact, readLabel }] });
      return acc;
    }
    lastGroup.items.push({ ...message, compact, readLabel });
    return acc;
  }, []);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPaymentStatus(isAiBot ? "success" : "idle");
      setConsultationId(isAiBot ? "ai-session" : null);
      setInputValue("");
      setMessages(isAiBot ? [] : messages);
    }, 300);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-full max-w-lg max-h-[80vh] bg-background z-50 flex flex-col overflow-hidden shadow-xl border border-border rounded-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-4">
                <img
                  src={architect.profileImage}
                  alt={architect.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-body font-medium">{architect.name}</h3>
                  <p className="text-body-sm text-muted-foreground flex items-center gap-2">
                    <span>{architect.specialty}</span>
                    <span className={`inline-block h-2 w-2 rounded-full ${presenceCount > 1 ? "bg-emerald-500" : "bg-muted"}`} />
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {paymentStatus === "idle" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <span className="text-caption text-muted-foreground block mb-6">
                    Chat Pricing
                  </span>
                  <div className="text-display-lg mb-2">${chatPrice}</div>
                  <p className="text-body-sm text-muted-foreground mb-8">
                    One-time fee for a direct conversation
                  </p>

                  <div className="space-y-4 text-left max-w-xs mx-auto mb-8">
                    <div className="flex items-center gap-3">
                      <CheckIcon />
                      <span className="text-body-sm">Direct access to {architect.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckIcon />
                      <span className="text-body-sm">Unlimited messages for 7 days</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckIcon />
                      <span className="text-body-sm">Project consultation included</span>
                    </div>
                  </div>

                  <motion.button
                    onClick={handlePayment}
                    className="w-full py-4 bg-foreground text-background text-caption hover:bg-foreground/90 transition-colors"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    Buy Now
                  </motion.button>

                  <p className="text-xs text-muted-foreground mt-4">
                    Secure payment powered by payment gateway
                  </p>
                </motion.div>
              )}

              {paymentStatus === "processing" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-16"
                >
                  <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-body text-muted-foreground">Processing payment...</p>
                </motion.div>
              )}

              {paymentStatus === "success" && (
                <div className="space-y-4">
                  {groupedMessages.map((group) => (
                    <div key={group.date} className="space-y-3">
                      <div className="text-center text-xs text-muted-foreground">{group.date}</div>
                      {group.items.map((message) => (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.senderId.role === "architect" ? "justify-start" : "justify-end"}`}
                        >
                          <div
                            className={`max-w-[80%] p-4 relative ${
                              message.senderId.role === "architect" ? "bg-secondary" : "bg-foreground text-background"
                            } ${message.compact ? "mt-1" : "mt-3"}`}
                          >
                            {!message.compact ? <p className="text-xs opacity-70 mb-1">{message.senderId.name}</p> : null}
                            <p className="text-body-sm">{message.message}</p>
                            <span className="text-xs opacity-60 mt-2 block">
                              {new Date(message.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {message.senderId._id === user?.id && message.readLabel ? (
                                <span className="ml-2 inline-block align-middle">
                                  <motion.span
                                    className="inline-block w-2 h-2 rounded-full bg-emerald-400"
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                                  />
                                </span>
                              ) : ""}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ))}
                  {isTyping && (
                    <motion.div
                      className="flex items-center gap-2 mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <span className="w-2 h-2 rounded-full bg-muted animate-pulse" />
                      <motion.span
                        className="block w-8 h-3 rounded bg-muted"
                        animate={{ scaleX: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                        transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                      />
                      <span className="text-xs text-muted-foreground">Architect is typing…</span>
                    </motion.div>
                  )}
                  <div ref={endOfMessagesRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            {paymentStatus === "success" && (
              <div className="p-4 border-t border-border">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      } else {
                        socket?.emit("typing", { consultationId, userId: user?.id || "viewer" });
                      }
                    }}
                    onFocus={() => socket?.emit("typing", { consultationId, userId: user?.id || "viewer" })}
                    onBlur={() => socket?.emit("stop_typing", { consultationId, userId: user?.id || "viewer" })}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-secondary text-body-sm focus:outline-none"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-foreground text-background text-caption"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Send
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8l4 4 6-8" />
  </svg>
);

const buildAiResponse = (input: string) => {
  const normalized = input.toLowerCase();
  if (normalized.includes("budget")) {
    return "Share your target budget range and location, and I’ll map architects and cost bands that fit.";
  }
  if (normalized.includes("style") || normalized.includes("modern") || normalized.includes("minimal")) {
    return "Great style direction. Tell me your preferred materials and timeline and I’ll curate matching studios.";
  }
  if (normalized.includes("timeline") || normalized.includes("deadline")) {
    return "We can plan around your timeline. When do you want design kickoff and when do you need permits?";
  }
  if (normalized.includes("commercial") || normalized.includes("office")) {
    return "For commercial projects, I’ll focus on code-ready architects and space-planning teams. What square footage and use case?";
  }
  if (normalized.includes("home") || normalized.includes("residential")) {
    return "For residential projects, I’ll recommend architects with similar homes. What’s your plot size and location?";
  }
  return "Tell me your project type, location, and budget range. I’ll generate a tailored plan and shortlist.";
};

export default ChatModal;
