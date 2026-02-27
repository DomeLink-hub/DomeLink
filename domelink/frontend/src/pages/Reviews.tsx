
import { useEffect, useState } from "react";
import { Container, Section } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, Review } from "@/lib/api";

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    // Try to fetch reviews for the current user (as reviewer or reviewee)
    api.getMyReviews()
      .then(setReviews)
      .catch(() => setError("Failed to load reviews."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-pulse text-yellow-500">⭐</span> Reviews
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <div className="space-y-4">
            {reviews.length === 0 && !loading && <div className="dome-card p-4 text-center text-muted-foreground">No reviews yet. Share your feedback and experiences!</div>}
            {reviews.map((r, idx) => (
              <div key={r._id || idx} className="dome-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{(typeof r.reviewer === "object" ? r.reviewer?.name : r.reviewer) || "Anonymous"}</span>
                  <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                </div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
