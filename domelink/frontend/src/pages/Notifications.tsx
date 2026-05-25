
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type Notification } from "@/lib/api";
import { socket } from "@/lib/socket";

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const items = await api.getNotifications();
        if (!active) return;
        setNotifications(items);

        const unreadIds = items.filter((item) => !item.read).map((item) => item._id);
        for (const id of unreadIds) {
          void api.markNotificationRead(id).then((updated) => {
            if (!active) return;
            setNotifications((prev) => prev.map((item) => item._id === id ? updated : item));
          });
        }
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

  const handleMarkRead = async (id: string) => {
    try {
      const updated = await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? updated : n));
    } catch {
      setError("Failed to mark as read.");
    }
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
            {notifications.length === 0 && !loading && <div className="dome-card p-4 text-center text-muted-foreground">No notifications yet. Stay tuned for updates, messages, and project alerts!</div>}
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`dome-card p-4 flex items-center justify-between ${n.read ? "opacity-60" : ""}`}
                onClick={() => !n.read && handleMarkRead(n._id)}
                style={{ cursor: n.read ? "default" : "pointer" }}
              >
                <div>
                  <h2 className="font-semibold">{n.title}</h2>
                  <p>{n.body}</p>
                  <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.read && <span className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Mark as read</span>}
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
