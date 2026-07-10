import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { Link } from "react-router-dom";
import { api, type Architect, type ChatMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth"; // Fixed import path to match your App.tsx

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  architect: Architect;
  consultationId?: string | null;
}

type PaymentStatus = "idle" | "processing" | "success";

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const renderMarkdown = (value: string) => {
  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  let listItems: string[] = [];

  const closeList = () => {
    if (listItems.length > 0) {
      blocks.push(`<ul>${listItems.map((item) => `<li>${item}</li>`).join("")}</ul>`);
      listItems = [];
    }
  };

  const formatInline = (input: string) =>
    escapeHtml(input)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(formatInline(line.replace(/^[-*]\s+/, "")));
      continue;
    }

    closeList();

    if (/^###\s+/.test(line)) {
      blocks.push(`<h3>${formatInline(line.replace(/^###\s+/, ""))}</h3>`);
      continue;
    }

    if (/^##\s+/.test(line)) {
      blocks.push(`<h2>${formatInline(line.replace(/^##\s+/, ""))}</h2>`);
      continue;
    }

    if (/^#\s+/.test(line)) {
      blocks.push(`<h1>${formatInline(line.replace(/^#\s+/, ""))}</h1>`);
      continue;
    }

    blocks.push(`<p>${formatInline(line)}</p>`);
  }

  closeList();
  return blocks.join("");
};

const MessageBody = ({ message, isAssistant }: { message: string; isAssistant: boolean }) => {
  if (!isAssistant) {
    return <p className="text-body-sm whitespace-pre-wrap">{message}</p>;
  }

  return (
    <div
      className="prose prose-sm max-w-none prose-headings:mb-2 prose-p:my-2 prose-li:my-1 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:bg-foreground/10 prose-code:text-current"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(message) }}
    />
  );
};

const ChatModal = ({ isOpen, onClose, architect, consultationId: initialConsultationId }: ChatModalProps) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const assistantId = architect._id || architect.id;
  const isAiBot = assistantId === "ai-bot";
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(initialConsultationId || isAiBot ? "success" : "idle");
  const [consultationId, setConsultationId] = useState<string | null>(initialConsultationId || null);
  const [inputValue, setInputValue] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]); // Relaxed type slightly for Prisma flexibility
  const [isTyping, setIsTyping] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const [presenceCount, setPresenceCount] = useState(1);

  const chatPrice = 49; 

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
      auth: {
        token: localStorage.getItem("domelink_token") // Send token for the backend middleware
      }
    });

    socketClient.emit("join_chat", consultationId); // Matches your socket.ts event name

    socketClient.on("receive_message", (message: any) => {
      setMessages((prev) => {
        // PRISMA FIX: Changed _id to id
        const exists = prev.some((item) => item.id === message.id);
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
          // PRISMA FIX: Changed _id to id
          if (!messageIds.includes(message.id)) return message;
          const alreadyRead = message.readBy?.some((entry: any) => entry.userId === userId);
          if (alreadyRead) return message;
          return {
            ...message,
            readBy: [...(message.readBy || []), { userId, readAt: new Date().toISOString() }],
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
    
    // PRISMA FIX: Mapped senderId._id to sender.id
    const hasUnread = messages.some((message) => 
      message.sender?.id !== user?.id && !message.readBy?.some((entry: any) => entry.userId === user?.id)
    );
    if (!hasUnread) return;
    markReadMutation.mutate();
  }, [consultationId, isOpen, messages, paymentStatus, user?.id, markReadMutation, isAiBot]);

  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => api.sendChat(consultationId || "", message),
    onSuccess: (message) => {
      setMessages((prev) => {
        const messageId = message.id || message._id;
        if (messageId && prev.some((item) => (item.id || item._id) === messageId)) {
          return prev;
        }
        return [...prev, message];
      });
      socket?.emit("send_message", {
        ...message,
        consultationId,
      });
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
      architectId: assistantId || architect._id,
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
      
      const userMessage = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        consultationId,
        sender: { id: userId, name: userName, role: "CLIENT" },
        message: inputValue,
        timestamp: now,
        readBy: [],
      };
      
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);
      
      const nextResponseId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setMessages((prev) => [...prev, {
          id: nextResponseId,
          consultationId,
          sender: { id: assistantId, name: architect.name, role: "ARCHITECT", avatar: architect.profileImage },
          message: "",
          timestamp: new Date().toISOString(),
          readBy: [],
      }]);
      
      (async () => {
         try {
           const token = localStorage.getItem("domelink_token");
           const conversationContext = messages
              .filter(m => !m.isSystemMessage)
              .map(m => ({ 
                role: m.sender?.id === user?.id ? "user" : "assistant",
                content: m.message 
              }));
              
           conversationContext.push({ role: "user", content: inputValue });

           const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/ai/chat`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { "Authorization": `Bearer ${token}` } : {})
              },
              body: JSON.stringify({ messages: conversationContext, stream: true })
           });

           if (!response.body) throw new Error("No body");
           const reader = response.body.getReader();
           const decoder = new TextDecoder("utf-8");
           let buffer = "";

           while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n\n");
              buffer = lines.pop() || "";
              
              for (const line of lines) {
                 if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]") {
                       setIsTyping(false);
                       return;
                    }
                    try {
                       const parsed = JSON.parse(data);
                       if (parsed.text) {
                          setMessages(prev => prev.map(m => {
                             if (m.id === nextResponseId) {
                                return { ...m, message: m.message + parsed.text };
                             }
                             return m;
                          }));
                          endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
                       }
                    } catch (e) {}
                 }
              }
           }
         } catch (err) {
            setMessages(prev => prev.map(m => {
                if (m.id === nextResponseId && m.message === "") {
                   return { ...m, message: "I'm sorry, I am currently experiencing degraded connection. Let's try again in a moment." };
                }
                return m;
             }));
         } finally {
            setIsTyping(false);
         }
      })();
      return;
    }

    // Emit via Socket directly for instant UI update
    // socket?.emit("send_message", { consultationId, message: inputValue });
    // sendMessageMutation.mutate(inputValue);
    sendMessageMutation.mutate(inputValue);
    setInputValue("");
  };

  useEffect(() => {
    if (!isOpen || !isAiBot) return;
    if (messages.length > 0) return;
    const now = new Date().toISOString();
    
    const initialMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, // PRISMA FIX
      consultationId: "ai-session",
      sender: { id: assistantId || "ai-bot", name: architect.name, role: "ARCHITECT", avatar: architect.profileImage },
      message: aiPrompt,
      timestamp: now,
      readBy: [],
    };
    setMessages([initialMessage]);
  }, [aiPrompt, assistantId, architect.name, architect.profileImage, isAiBot, isOpen, messages.length]);

  const groupedMessages = messages.reduce<Array<{ date: string; items: Array<any & { compact: boolean; readLabel?: string }> }>>((acc, message, index) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    const previous = messages[index - 1];
    
    // PRISMA FIX: Check sender.id instead of senderId._id
    const compact = Boolean(previous && previous.sender?.id === message.sender?.id);
    const readCountExcludingSender = message.readBy?.filter((entry: any) => entry.userId !== message.sender?.id).length || 0;
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={handleClose}
          />

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
                  src={architect.profileImage || architect.avatar}
                  alt={architect.name}
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover"
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
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
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
                          key={message.id} // PRISMA FIX
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.isSystemMessage ? "justify-center" : (message.sender?.id === architect._id ? "justify-start" : "justify-end")}`} 
                        >
                          {message.isSystemMessage ? (
                             <div className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full my-2">
                               {message.message}
                             </div>
                          ) : (
                             <div
                               className={`max-w-[80%] p-4 relative rounded-xl ${
                                 message.sender?.id === architect._id ? "bg-secondary text-foreground" : "bg-foreground text-background"
                               } ${message.compact ? "mt-1" : "mt-3"}`}
                             >
                               {!message.compact ? <p className="text-xs opacity-70 mb-1">{message.sender?.name}</p> : null}
                               <MessageBody message={message.message} isAssistant={message.sender?.id === assistantId} />
                               <span className="text-xs opacity-60 mt-2 block">
                                 {new Date(message.timestamp).toLocaleTimeString([], {
                                   hour: "2-digit",
                                   minute: "2-digit",
                                 })}
                                 {message.sender?.id === user?.id && message.readLabel ? (
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
                          )}
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
                      <span className="text-xs text-muted-foreground">
                        {isAiBot ? "Avora is thinking…" : "Architect is typing…"}
                      </span>
                    </motion.div>
                  )}
                  <div ref={endOfMessagesRef} />
                </div>
              )}
            </div>

            {/* Message Input */}
            {paymentStatus === "success" && (
              <div className="p-4 border-t border-border">
                {consultationId && !isAiBot && (
                  <div className="mb-2 text-right">
                    <Link
                      to={`/messages?consultation=${consultationId}`}
                      className="text-caption text-muted-foreground hover:text-foreground link-underline"
                      onClick={handleClose}
                    >
                      Open full chat
                    </Link>
                  </div>
                )}
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
                    className="flex-1 px-4 py-3 bg-secondary text-body-sm focus:outline-none rounded-md"
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    className="px-6 py-3 bg-foreground text-background text-caption rounded-md"
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

export default ChatModal;