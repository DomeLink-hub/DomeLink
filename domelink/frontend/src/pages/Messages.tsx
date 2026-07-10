import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { useSearchParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Container, Section } from "@/components/layout/Layout";
import { api, type ChatConversationItem, type ChatMessage } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import ConsultationPaymentModal from "@/components/payments/ConsultationPaymentModal";

const getSenderId = (message: ChatMessage) => {
  return message.sender?.id || message.senderId?._id || "";
};

const getSenderName = (message: ChatMessage) => {
  return message.sender?.name || message.senderId?.name || "Unknown";
};

const getMessageId = (message: ChatMessage) => {
  return message.id || message._id || `${message.consultationId}-${message.timestamp}-${message.message}`;
};

const getConversationId = (conversation: ChatConversationItem) => conversation.id || conversation._id;

const Messages = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedConsultationId, setSelectedConsultationId] = useState<string>(searchParams.get("consultation") || "");
  const [draft, setDraft] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ChatConversationItem[]>({
    queryKey: queryKeys.chatConversations(),
    queryFn: api.getChatConversations,
  });

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => getConversationId(conversation) === selectedConsultationId),
    [conversations, selectedConsultationId],
  );

  useEffect(() => {
    if (selectedConsultationId) return;
    if (conversations.length === 0) return;
    const fallbackId = getConversationId(conversations[0]);
    if (!fallbackId) return;
    setSelectedConsultationId(fallbackId);
    setSearchParams((prev) => {
      if (prev.get("consultation") === fallbackId) return prev;
      const next = new URLSearchParams(prev);
      next.set("consultation", fallbackId);
      return next;
    }, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversations.length, selectedConsultationId]);

  const { data: persistedMessages, isLoading: messagesLoading } = useQuery<ChatMessage[]>({
    queryKey: queryKeys.chat(selectedConsultationId || ""),
    queryFn: () => api.getChat(selectedConsultationId),
    enabled: Boolean(selectedConsultationId),
  });

  useEffect(() => {
    setLiveMessages(persistedMessages || []);
  }, [persistedMessages]);

  const markReadMutation = useMutation({
    mutationFn: (consultationId: string) => api.markChatRead(consultationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations() });
    },
  });

  useEffect(() => {
    if (!selectedConsultationId) return;
    markReadMutation.mutate(selectedConsultationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConsultationId]);

  useEffect(() => {
    if (!selectedConsultationId) return;

    const socketClient = io(import.meta.env.VITE_API_BASE_URL, {
      transports: ["websocket"],
      auth: {
        token: localStorage.getItem("domelink_token") || "",
      },
    });

    socketClient.emit("join_chat", selectedConsultationId);

    const upsertMessage = (incoming: ChatMessage) => {
      setLiveMessages((prev) => {
        const incomingId = getMessageId(incoming);
        if (prev.some((item) => getMessageId(item) === incomingId)) return prev;
        return [...prev, incoming].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations() });
    };

    socketClient.on("receive_message", (message: ChatMessage) => {
      if (message.consultationId !== selectedConsultationId) return;
      upsertMessage(message);
    });

    socketClient.on("new_message", (message: ChatMessage) => {
      if (message.consultationId !== selectedConsultationId) return;
      upsertMessage(message);
    });

    setSocket(socketClient);

    return () => {
      socketClient.disconnect();
      setSocket(null);
    };
  }, [queryClient, selectedConsultationId]);

  const sendMessageMutation = useMutation({
    mutationFn: ({ consultationId, message }: { consultationId: string; message: string }) =>
      api.sendChat(consultationId, message),
    onSuccess: (message) => {
      setDraft("");
      setLiveMessages((prev) => {
        const msgId = getMessageId(message);
        if (prev.some((item) => getMessageId(item) === msgId)) return prev;
        return [...prev, message].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
        );
      });
      if (selectedConsultationId) {
        socket?.emit("send_message", {
          ...message,
          consultationId: selectedConsultationId,
        });
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.chat(selectedConsultationId || "") });
      void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations() });
    },
    onError: () => {
      toast.error("Could not send message");
    },
  });

  const conversationItems = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aTs = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : new Date(a.updatedAt).getTime();
      const bTs = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : new Date(b.updatedAt).getTime();
      return bTs - aTs;
    });
  }, [conversations]);

  const isArchitect = String(user?.role || "").toUpperCase() === "ARCHITECT";
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  // Show "Proceed to Engagement" for homeowners on PENDING or ACCEPTED consultations
  const paymentEligibleStatuses = ["PENDING", "ACCEPTED", "pending", "accepted"];
  const showPaymentButton =
    !isArchitect &&
    selectedConversation &&
    paymentEligibleStatuses.includes(String(selectedConversation.status));

  const handleSelectConversation = (consultationId: string) => {
    setSelectedConsultationId(consultationId);
    setSearchParams({ consultation: consultationId });
  };

  const handleSend = () => {
    const message = draft.trim();
    if (!message || !selectedConsultationId) return;
    sendMessageMutation.mutate({ consultationId: selectedConsultationId, message });
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <Section className="pt-28 pb-24">
          <Container>
            <div className="dome-card p-0 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] min-h-[70vh]">
                <aside className="border-r border-border/60 bg-secondary/20">
                  <div className="p-4 border-b border-border/60">
                    <h1 className="text-display-sm">Messages</h1>
                    <p className="text-body-sm text-muted-foreground mt-1">All consultations</p>
                  </div>

                  <div className="max-h-[70vh] overflow-y-auto">
                    {conversationsLoading ? (
                      <div className="p-4 text-body-sm text-muted-foreground">Loading conversations...</div>
                    ) : conversationItems.length === 0 ? (
                      <div className="p-4 text-body-sm text-muted-foreground">No conversations yet.</div>
                    ) : (
                      conversationItems.map((conversation) => {
                        const consultationId = getConversationId(conversation);
                        const isActive = selectedConsultationId === consultationId;
                        const other = isArchitect ? conversation.user : conversation.architect;
                        const title = isArchitect
                          ? `${conversation.user.city || "Unknown city"} • ${conversation.user.projectType || "Project"}`
                          : other.name;
                        const subtitle = `${other.name} • ${other.role}`;

                        return (
                          <button
                            key={consultationId}
                            type="button"
                            onClick={() => handleSelectConversation(consultationId)}
                            className={`w-full text-left p-4 border-b border-border/40 transition-colors ${
                              isActive ? "bg-background" : "hover:bg-background/70"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-body-sm font-medium truncate">{title}</p>
                                <p className="text-caption text-muted-foreground truncate">{subtitle}</p>
                                <p className="text-caption text-muted-foreground truncate mt-1">
                                  {conversation.lastMessage?.message || "No messages yet"}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-[11px] text-muted-foreground">
                                  {new Date(conversation.lastMessage?.timestamp || conversation.updatedAt).toLocaleString()}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                    {conversation.unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </aside>

                <section className="flex flex-col min-h-[70vh]">
                  <div className="p-4 border-b border-border/60">
                    {selectedConversation ? (
                      <>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h2 className="text-body font-medium">
                              {isArchitect
                                ? `${selectedConversation.user.city || "Unknown city"} • ${selectedConversation.user.projectType || "Project"}`
                                : selectedConversation.architect.name}
                            </h2>
                            <p className="text-body-sm text-muted-foreground">
                              {isArchitect
                                ? `${selectedConversation.user.name} • ${selectedConversation.user.role}`
                                : `${selectedConversation.architect.name} • ${selectedConversation.architect.role}`}
                            </p>
                          </div>
                          {showPaymentButton && (
                            <button
                              type="button"
                              className="dome-button text-xs px-4 py-2 flex-shrink-0"
                              onClick={() => setIsPaymentOpen(true)}
                            >
                              Proceed to Engagement
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <h2 className="text-body text-muted-foreground">Select a conversation</h2>
                    )}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {!selectedConsultationId ? (
                      <p className="text-body-sm text-muted-foreground">Choose a conversation from the left panel.</p>
                    ) : messagesLoading ? (
                      <p className="text-body-sm text-muted-foreground">Loading messages...</p>
                    ) : liveMessages.length === 0 ? (
                      <p className="text-body-sm text-muted-foreground">No messages yet.</p>
                    ) : (
                      liveMessages.map((message) => {
                        const mine = getSenderId(message) === user?.id;
                        return (
                          <div key={getMessageId(message)} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-xl px-4 py-3 ${mine ? "bg-foreground text-background" : "bg-secondary"}`}>
                              <p className="text-body-sm whitespace-pre-wrap">{message.message}</p>
                              <div className="mt-1 text-[11px] opacity-70 flex items-center gap-2">
                                <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                {mine && <span>Delivered</span>}
                                {!mine && <span>{getSenderName(message)}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-4 border-t border-border/60">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-md border border-border px-3 py-2 bg-background"
                        placeholder="Type your message..."
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSend();
                        }}
                        disabled={!selectedConsultationId || sendMessageMutation.isPending}
                      />
                      <button
                        type="button"
                        className="dome-button"
                        onClick={handleSend}
                        disabled={!selectedConsultationId || sendMessageMutation.isPending}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />

      {/* Section 5 — payment trigger from consultation/chat view */}
      {selectedConversation && !isArchitect && (
        <ConsultationPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          architectId={selectedConversation.architect.id}
          architectName={selectedConversation.architect.name}
          consultationId={getConversationId(selectedConversation)}
          onPaymentSuccess={() => {
            setIsPaymentOpen(false);
            void queryClient.invalidateQueries({ queryKey: queryKeys.chatConversations() });
            toast.success("Payment confirmed. Your engagement is active.");
          }}
        />
      )}
    </PageTransition>
  );
};

export default Messages;
