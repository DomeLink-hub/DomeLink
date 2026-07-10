import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type Notification } from "@/lib/api";
import { socket } from "@/lib/socket";

function getNotificationHref(n: Notification): string | null {
  if (n.type === "lead_interest" && n.metadata) {
    const slug = n.metadata.architectSlug ?? n.metadata.architectId;
    if (slug) return `/architect/${String(slug)}`;
  }
  if (n.type === "consultation_status") {
    return "/messages";
  }
  return null;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const items = await api.getNotifications();
        if (!active) return;
        setNotifications(items);
      } catch {
        if (active) setError("Failed to load notifications.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    const onNotification = (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    };

    socket.on("notification", onNotification);

    return () => {
      active = false;
      socket.off("notification", onNotification);
    };
  }, []);

  const handleClick = async (n: Notification) => {
    // Mark read first (non-blocking)
    if (!n.read) {
      try {
        const updated = await api.markNotificationRead(n._id);
        setNotifications((prev) => prev.map((item) => item._id === n._id ? updated : item));
      } catch {
        // non-fatal
      }
    }

    const href = getNotificationHref(n);
    if (href) navigate(href);
  };

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-bounce text-blue-500">🔔</span> Notifications
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {notifications.length === 0 && !loading && (
              <div className="dome-card p-4 text-center text-muted-foreground">
                No notifications yet. Stay tuned for updates, messages, and project alerts!
              </div>
            )}
            {notifications.map((n) => {
              const href = getNotificationHref(n);
              const isClickable = Boolean(href);
              return (
                <div
                  key={n._id}
                  className={`dome-card p-4 flex items-center justify-between transition-opacity ${n.read ? "opacity-60" : ""} ${isClickable ? "cursor-pointer hover:opacity-90" : ""}`}
                  onClick={() => handleClick(n)}
                  role={isClickable ? "button" : undefined}
                  tabIndex={isClickable ? 0 : undefined}
                  onKeyDown={(e) => { if (isClickable && (e.key === "Enter" || e.key === " ")) handleClick(n); }}
                >
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold">{n.title}</h2>
                    <p className="text-body-sm text-muted-foreground">{n.body}</p>
                    {n.type === "lead_interest" && n.metadata?.architectName && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Studio: {String(n.metadata.architectName)}
                      </p>
                    )}
                    <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {!n.read && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Unread</span>
                    )}
                    {isClickable && (
                      <span className="px-2 py-1 bg-secondary text-foreground rounded text-xs">
                        {n.type === "lead_interest" ? "View profile →" : "View →"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
