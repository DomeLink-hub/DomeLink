import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import { api, Review } from "@/lib/api";

export default function ReviewSystem() {
  const { architectId } = useParams();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchReviews = useCallback(async () => {
    if (!architectId) {
      setReviews([]);
      return;
    }
    try {
      const res = await api.getReviews(architectId);
      setReviews(res);
    } catch (e) {
      setReviews([]);
    }
  }, [architectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!architectId) {
      setError("Architect not found.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await api.createReview({ architectId, rating, comment });
      setSuccess("Review submitted!");
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (e) {
      setError("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch reviews on mount
  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-2xl font-bold mb-4">Leave a Review</h1>
          <form onSubmit={handleSubmit} className="mb-8">
            <div className="mb-2">
              <label className="block mb-1 font-medium">Rating</label>
              <select
                className="dome-input w-full"
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                required
              >
                <option value={0}>Select rating</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1 font-medium">Comment</label>
              <textarea
                className="dome-input w-full"
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                required
              />
            </div>
            <button className="dome-button px-8 py-2" type="submit" disabled={loading}>
              {loading ? "Submitting..." : "Submit Review"}
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
          </form>
          <h2 className="text-xl font-semibold mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.length === 0 && <div>No reviews yet.</div>}
            {reviews.map((r, idx) => (
              <div key={r._id || idx} className="dome-card p-4">
                <div className="font-semibold mb-1">{(typeof r.reviewer === "object" ? r.reviewer?.name : r.reviewer) || "Anonymous"}</div>
                <div className="text-yellow-500 mb-1">{"★".repeat(r.rating)}<span className="text-gray-400">{"★".repeat(5 - r.rating)}</span></div>
                <div className="text-sm mb-1">{r.comment}</div>
                <div className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}
